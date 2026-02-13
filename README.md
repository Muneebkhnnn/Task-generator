Requirements:
fill a small form about a feature idea (goal, users, constraints)
generate a list of user stories and engineering tasks
edit, reorder, and group tasks
export the result (copy/download as text or markdown)
see the last 5 specs I generated
Make it your own: for example, add templates (mobile/web/internal tool) or “risk/unknowns” section.

Whats Done:
Everything is completed which was required apart from that , the editing of todo is only maintained on the client side although we could have save it in the localstorage but that will be of no use as refreshing the list will have request the resource again from the api 

### Setup

Clone the repository


Install dependencies

# Client
cd client
npm install

# Server
cd ../server
npm install
```

Environment Variables**

Create `.env` in both client and server directories:

Client (`client/.env`):

VITE_BASE_URL=http://localhost:3000


Server (`server/.env`):
```env
PORT=3000
DATABASE_RL=postgresql://
ClientUrl=localhost:5173
GEMINI_API_KEY=your_api_key_here
```

Run the application

cd server
npm run dev


cd client
npm run dev


