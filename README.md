# IntellMeet

IntellMeet is an AI-powered enterprise meeting and collaboration platform.

This README is the **step-by-step “setup for humans” guide** to get the project running locally.

---

## 1) What you will run

- **Backend**: Express API + MongoDB (with optional in-memory fallback)
- **Frontend**: Vite + React app
- **Realtime**: Socket.IO (used by meeting/chat/tasks/notifications)
- **SFU (WebRTC)**: mediasoup integration (signaling layer is wired)

---

## 2) Before you start (check your tools)

You need:

1. **Git**
2. **Node.js** (and npm)
3. **Windows**: PowerShell/Terminal
4. **MongoDB** (recommended) OR you can rely on the in-memory fallback

Check Node:

```bat
node -v
npm -v
```

If these commands fail, install Node.js first.

---

## 3) Get the code

From a terminal (folder you want to keep the project in):

```bat
git clone https://github.com/STERDINATOR/IntellMeet-clean.git
cd IntellMeet-clean
```

---

## 4) Create your environment files (VERY IMPORTANT)

### 4.1 Copy `.env.example` to `.env`

In the repo root:

1. Find `.env.example`
2. Copy it as `.env`

Typical:

```bat
copy .env.example .env
```

### 4.2 Fill in required values

Open `.env` and update values like:

- `OPENAI_API_KEY` (if you want AI features)
- OAuth client secrets (if you use Google/Microsoft login)
- `VITE_SOCKET_URL` (frontend should connect to backend socket URL)
- `MONGO_URI` (if you want a real MongoDB instead of fallback)

#### Rule:
Never commit real secrets to GitHub.

---

## 5) Start with Docker (easiest)

### 5.1 Use docker-compose

From repo root:

```bat
docker-compose up --build
```

This should:
- start backend
- start frontend (depending on compose configuration)
- start MongoDB (if included in compose)

### 5.2 Wait until everything is “ready”

You might see logs like:
- backend listening
- database connected
- frontend compiling

If you see errors, stop and fix the `.env` issues.

---

## 6) Run without Docker (manual mode)

You will run Backend and Frontend separately.

---

## 7) Backend setup (step-by-step)

### 7.1 Install backend dependencies

```bat
cd Backend
npm install
```

### 7.2 Build backend (TypeScript)

```bat
npm run build
```

### 7.3 Start backend

```bat
npm run start
```

Backend should listen on something like:
- `http://localhost:4000`

Check:

```bat
curl http://localhost:4000/health
```

You should see JSON like `{ ok: true ... }`.

---

## 8) Frontend setup (step-by-step)

### 8.1 Install frontend dependencies

```bat
cd Frontend
npm install
```

### 8.2 Build frontend

```bat
npm run build
```

### 8.3 Start frontend

```bat
npm run dev
```

Open in your browser:
- typically `http://localhost:5173`

---

## 9) Verify realtime and workflows (quick sanity checklist)

### 9.1 Sign up / login
- Go to the frontend login page
- Create a user

### 9.2 Test API + state updates
- Go to **Meetings** → schedule/instant meeting
- Join a meeting room
- Open **Tasks** and create/update a task
- Open **Notifications** and confirm they appear

If realtime is working, the UI updates **without page refresh**.

---

## 10) Common problems and “what to do”

### Problem A: “Missing token” in socket
Cause: socket client can’t read access token.
Fix:
- Ensure you logged in
- Ensure `VITE_SOCKET_URL` points to backend

### Problem B: AI routes fail
Cause: `OPENAI_API_KEY` missing.
Fix:
- set `OPENAI_API_KEY` in `.env`

### Problem C: MongoDB connection fails
Cause: `MONGO_URI` incorrect.
Fix:
- set correct `MONGO_URI`
- or start MongoDB locally

---

## 11) Repo layout

- `Frontend/` — React + routing + Zustand stores + realtime client
- `Backend/` — Express API, models, realtime (Socket.IO), AI streaming routes
- `docs/` — architecture diagrams and master blueprint
- `docker-compose.yml` — local orchestration

---

## 12) Next: Production build

Before production deploy:
- run `npm run build` in **both** folders
- ensure `.env` is populated
- ensure secrets are stored in your hosting secret manager

---

## Helpful docs

- `docs/INTELLMEET_MASTER_BLUEPRINT.md`
- `docs/System Architecture Diagram.png`
- `docs/Sequence Diagram.png`

