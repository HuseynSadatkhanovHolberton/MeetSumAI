MeetSumAI
===========

Production-ready AI meeting summarizer for demo day. Paste a transcript and get decisions, actions, and open questions in seconds.

## Tech Stack

- **Frontend**: React + Vite with Tailwind CSS for a modern, responsive UI
- **Backend**: Node.js with Claude AI integration via Anthropic API
- **Deployment**: Vercel (frontend) and Render (backend)

## Features
--------
- Executive summary bullets from raw meeting notes
- Action items with owners and deadlines extracted automatically
- Open questions highlighted to unblock next steps

Local Development
-----------------

Backend

```
cd backend
npm install
npm start
```

Frontend

```
cd frontend
npm install
npm run dev
```

Environment Variables
---------------------

Backend
- `ANTHROPIC_API_KEY` (required)

Frontend
- `VITE_API_URL` (optional, defaults to http://localhost:3001)

Deploy
------

Backend (Render)
1. Connect the GitHub repo to Render
2. Root Directory: `backend`
3. Build Command: `npm install`
4. Start Command: `node index.js`
5. Add `ANTHROPIC_API_KEY` environment variable

Frontend (Vercel)
1. Import the GitHub repo in Vercel
2. Root Directory: `frontend`
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Add `VITE_API_URL` environment variable

Get an Anthropic API key: https://console.anthropic.com
