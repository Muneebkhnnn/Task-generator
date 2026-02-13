import { asyncHandler } from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import sql from "../DB/db.js";
import OpenAI from "openai";

export const healthCheck = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  
  const status = {
    server: { status: "healthy", responseTime: 0, timestamp: new Date().toISOString() },
    database: { status: "unknown", responseTime: 0, error: null },
    llm: { status: "unknown", responseTime: 0, error: null }
  };

  status.server.responseTime = Date.now() - startTime;

  const dbStart = Date.now();
  try {
    await sql`SELECT 1 as health_check`;
    status.database.status = "healthy";
    status.database.responseTime = Date.now() - dbStart;
  } catch (error) {
    status.database.status = "unhealthy";
    status.database.error = error.message;
    status.database.responseTime = Date.now() - dbStart;
  }

  const llmStart = Date.now();
  try {
    const client = new OpenAI({
      apiKey: process.env.GEMINI_API_KEY,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    });

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("API key not configured");
    }

    await client.models.list();
    
    status.llm.status = "healthy";
    status.llm.responseTime = Date.now() - llmStart;
  } catch (error) {
    status.llm.status = "unhealthy";
    status.llm.error = error.message;
    status.llm.responseTime = Date.now() - llmStart;
  }

  const overallHealthy = 
    status.server.status === "healthy" && 
    status.database.status === "healthy" && 
    status.llm.status === "healthy";

  return res.status(overallHealthy ? 200 : 503).json(
    new apiResponse(
      overallHealthy ? 200 : 503,
      status,
      overallHealthy ? "All systems operational" : "Some systems are down"
    )
  );
});

export const getComponentStatus = asyncHandler(async (req, res) => {
  const { component } = req.params;

  switch (component) {
    case "database":
      try {
        const result = await sql`
          SELECT 
            current_database() as database_name,
            version() as version,
            current_timestamp as server_time
        `;
        return res.status(200).json(
          new apiResponse(200, result[0], "Database details retrieved")
        );
      } catch (error) {
        return res.status(503).json(
          new apiResponse(503, null, error.message)
        );
      }

    case "llm":
      try {
        const client = new OpenAI({
          apiKey: process.env.GEMINI_API_KEY,
          baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
        });
        
        const models = await client.models.list();
        return res.status(200).json(
          new apiResponse(200, { available: true, models: models.data.slice(0, 5) }, "LLM connection successful")
        );
      } catch (error) {
        return res.status(503).json(
          new apiResponse(503, null, error.message)
        );
      }

    default:
      return res.status(400).json(
        new apiResponse(400, null, "Invalid component")
      );
  }
});
