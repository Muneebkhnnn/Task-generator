import { asyncHandler } from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import OpenAI from "openai";
import sql from "../DB/db.js";

export const createTask = asyncHandler(async (req, res) => {
  const { goal, users, constraints, template } = req.body;

  const client = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  });

  if (
    !goal ||
    !users ||
    !constraints ||
    !template ||
    [goal, users, constraints, template].some((field) => field?.trim() === "")
  ) {
    throw new apiError(400, "All Fields are required");
  }

  const [spec] = await sql`
    INSERT INTO specs (goal, users, constraints, template) 
    VALUES (${goal}, ${users}, ${constraints}, ${template})
    RETURNING id
  `;

  console.log("spec", spec);

  const specsId = spec.id;

  const prompt = `
    Generate structured planning output.

    Goal: ${goal}
    Target Users: ${users}
    Constraints: ${constraints}
    Template Type: ${template}

    Return ONLY valid JSON:

    {
      "userStories": [],
      "engineeringTasks": [],
      "risks": []
    }

      rules:
        - Do not include explanations or text outside JSON
        - Ensure arrays are not empty

    `;

  const response = await client.chat.completions.create({
    model: "gemini-2.5-flash",
    messages: [
      {
        role: "system",
        content:
          "You are a senior product manager and software architect. Always return valid, complete JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: 3000,
    temperature: 0.7,
  });

  const rawContent = response.choices[0].message.content;
  console.log(rawContent);
  const jsonMatch = rawContent.match(/\{[\s\S]*\}/); // for extracting JSON object from the response

  if (!jsonMatch) {
    throw new apiError(500, "No JSON returned from AI");
  }

  let parsedContent;
  console.log("json match", jsonMatch);
  try {
    parsedContent = JSON.parse(jsonMatch[0]);
  } catch {
    console.error("Invalid JSON:", rawContent);
    throw new apiError(500, "AI returned invalid JSON");
  }

  console.log("Parsed Content:", parsedContent);

  if (parsedContent.userStories && parsedContent.userStories.length > 0) {
    for (const story of parsedContent.userStories) {
      await sql`
        INSERT INTO user_stories (external_id, content, spec_id)
        VALUES (${story.id}, ${story.story}, ${specsId})
      `;
    }
  }

  if (
    parsedContent.engineeringTasks &&
    parsedContent.engineeringTasks.length > 0
  ) {
    for (const task of parsedContent.engineeringTasks) {
      await sql`
        INSERT INTO engineering_tasks (external_id, content, spec_id)
        VALUES (${task.id}, ${task.task}, ${specsId})
      `;
    }
  }

  if (parsedContent.risks && parsedContent.risks.length > 0) {
    for (const risk of parsedContent.risks) {
      await sql`
        INSERT INTO risks (external_id, risk, mitigation, spec_id)
        VALUES (${risk.id}, ${risk.risk}, ${risk.mitigation}, ${specsId})
      `;
    }
  }

  const finalResponse = {
    specsId,
    ...parsedContent,
  };

  return res
    .status(201)
    .json(new apiResponse(201, finalResponse, "Task created successfully"));
});

export const getTasks = asyncHandler(async (req, res) => {
    
  const specs = await sql`
    SELECT * FROM specs 
    ORDER BY created_at DESC 
    LIMIT 5
  `;

  const allTasks = [];

  for (const spec of specs) {
    const userStories = await sql`
      SELECT * FROM user_stories WHERE spec_id = ${spec.id}
    `;

    const engineeringTasks = await sql`
      SELECT * FROM engineering_tasks WHERE spec_id = ${spec.id}
    `;

    const risks = await sql`
      SELECT * FROM risks WHERE spec_id = ${spec.id}
    `;

    allTasks.push({
      specsId: spec.id,
      goal: spec.goal,
      users: spec.users,
      constraints: spec.constraints,
      template: spec.template,
      createdAt: spec.created_at,
      userStories: userStories.map((story) => ({
        id: story.id,
        story: story.content,
      })),
      engineeringTasks: engineeringTasks.map((task) => ({
        id: task.id,
        task: task.content,
      })),
      risks: risks.map((risk) => ({
        id: risk.id,
        risk: risk.risk,
        mitigation: risk.mitigation,
      })),
    });
  }

  return res
    .status(200)
    .json(new apiResponse(200, allTasks, "Tasks fetched successfully"));
});
