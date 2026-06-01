# IntellMeet Backend

MongoDB/Express/Socket.IO backend for IntellMeet.

## MongoDB Compass

1. Start MongoDB locally.
2. Open MongoDB Compass.
3. Connect to:

```text
mongodb://127.0.0.1:27017/intellmeet
```

4. Copy `.env.example` to `.env` and keep `MONGODB_URI` pointed at that URI.

## Run

```bash
npm install
npm run dev
```

API: `http://localhost:4000/api`

Frontend env:

```text
VITE_API_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
```

## Implemented Slices

- MongoDB Compass database via Mongoose schemas.
- JWT auth with refresh token storage.
- CRUD APIs for meetings, transcripts, chat, tasks, projects, notifications, and reports.
- Socket.IO realtime for presence, chat, task updates, notifications, and WebRTC signaling.
- OpenAI-compatible streaming endpoints for Copilot, meeting summaries, transcript Q&A, and action-item extraction.
