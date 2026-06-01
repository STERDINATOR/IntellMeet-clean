# INTELLMEET MASTER BLUEPRINT

## AI-Powered Enterprise Meeting & Collaboration Platform

### Complete Product Architecture, Features, Routes, Flows, and Project Structure

---

## 🌍 PRODUCT OVERVIEW

IntellMeet is a unified AI collaboration ecosystem that combines:

- Google Meet
- Slack
- Notion
- Linear
- Microsoft Teams
- OpenAI Copilot

into one platform.

---

## 🏗 HIGH LEVEL SYSTEM

```
┌───────────────────────────────┐
│         Frontend              │
│ React + TS + Tailwind         │
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│         API Gateway           │
│       Express Backend         │
└──────────────┬────────────────┘
               │
     ┌─────────┼──────────┐
     ▼         ▼          ▼

 MongoDB     Redis      OpenAI

     │                    │
     ▼                    ▼

Meeting Data      AI Intelligence

     │
     ▼

 Socket.io + WebRTC
```

---

## 📂 COMPLETE REPOSITORY STRUCTURE

```
IntellMeet/

├── Frontend/
├── Backend/
├── docs/
├── infrastructure/
├── shared/
├── scripts/
├── .github/
├── docker-compose.yml
└── README.md
```

> Note: This repository currently contains `Frontend/` and `Backend/` folders.

---

## 🎨 FRONTEND STRUCTURE

```
Frontend/src/

├── app/
├── pages/
├── layouts/
├── components/
├── hooks/
├── store/
├── contexts/
├── providers/
├── routes/
├── services/
├── sockets/
├── assets/
├── animations/
├── utils/
├── constants/
├── lib/
├── styles/
└── types/
```

---

## ⚙ BACKEND STRUCTURE

```text
Backend/src/

├── config/
├── controllers/
├── routes/
├── services/
├── models/
├── middleware/
├── sockets/
├── webrtc/
├── validators/
├── jobs/
├── ai/
├── utils/
├── types/
├── app.ts
└── server.ts
```

---

## 🌐 COMPLETE ROUTING MAP

### PUBLIC ROUTES

- `/`
  - Landing page
  - Product showcase, marketing, pricing, CTA

- `/login`
  - User login

- `/signup`
  - User registration

- `/forgot-password`
  - Password recovery

---

### AUTHENTICATED ROUTES

- `/dashboard`
  - Main workspace
  - Productivity score, upcoming meetings, AI insights, tasks, notifications, team metrics

---

### MEETINGS

- `/meetings`
  - Meeting management
  - List, search, filters, schedule, join, edit

- `/meeting/:meetingId`
  - Live meeting room
  - WebRTC room, video, audio, chat, AI assistant, screen sharing, participants

- `/calendar`
  - Meeting calendar
  - Upcoming meetings, recurring meetings, team calendar

---

### AI SYSTEM

- `/ai-assistant`
  - AI control center
  - AI chat, AI search, AI summary, AI reports, AI planning

- `/meeting-summary/:meetingId`
  - Meeting intelligence
  - Transcript, summary, decisions, action items

---

### WORKSPACE

- `/workspace`
  - Workspace overview
  - Notes, shared files, team activity

---

### PROJECTS

- `/projects`
  - Projects dashboard
  - Kanban, milestones, progress

- `/projects/:projectId`
  - Single project page
  - Tasks, timeline, team members

---

### TASKS

- `/tasks`
  - Task center
  - Table, filters, AI priorities

- `/tasks/:taskId`
  - Task detail page
  - Comments, activity, files

---

### TEAM

- `/team`
  - Team directory
  - Search users, departments, online status

- `/team/:memberId`
  - Team member profile
  - Activity, contributions, meetings

---

### ANALYTICS

- `/analytics`
  - Analytics dashboard
  - Productivity, engagement, team metrics

---

### REPORTS

- `/reports`
  - Reports center
  - Export reports, AI reports

- `/reports/:reportId`
  - Single report
  - View, download, share

---

### PROFILE & SETTINGS

- `/profile`
  - Current user profile
  - Edit profile, upload avatar, settings

- `/notifications`
  - Notification center
  - Read, filter, archive

- `/settings`
  - Application settings
  - Profile, security, workspace, theme

- `/admin`
  - Admin panel
  - User management, analytics, monitoring

---

## 🤖 AI FEATURES

### Global AI Copilot

Available on every page as a floating widget in the bottom-right corner.

Functions:

- Search workspace
- Search meetings
- Create tasks
- Generate reports
- Generate sprint plans
- Answer questions
- Generate summaries

---

### Meeting AI

Inside the meeting room:

- Live transcription
- Live summary
- Action items
- Decision tracking
- Meeting analytics

---

### AI Analytics

Dashboard AI functions:

- Productivity score
- Engagement score
- Recommendations

---

## 🎥 MEETING ROOM FLOW

### Start Instant Meeting

```text
Dashboard
      ↓
Start Instant Meeting
      ↓
Generate Room ID
      ↓
Create Meeting Record
      ↓
Generate URL
      ↓
Redirect
      ↓
Meeting Room
```

### Join Meeting

```text
Meeting Link
      ↓
Meeting Lobby
      ↓
Camera Preview
      ↓
Microphone Preview
      ↓
Join
      ↓
Meeting Room
```

---

## ⚡ SOCKET EVENTS

- join-room
- leave-room
- user-online
- user-offline
- message-sent
- message-received
- typing-start
- typing-stop
- participant-joined
- participant-left
- meeting-started
- meeting-ended
- task-updated
- notification-created

---

## 🎥 WEBRTC FEATURES

- Audio
- Video
- Screen share
- Raise hand
- Reactions
- Captions
- Recording
- Participant grid
- Active speaker detection

---

## 🍃 DATABASE COLLECTIONS

- Users
- Meetings
- Projects
- Tasks
- Messages
- Notifications
- Analytics
- AIReports
- AISummaries
- Transcripts
- Roles
- Permissions
- Workspaces

---

## 🔐 AUTHENTICATION FLOW

```text
Signup
 ↓
Verify Email
 ↓
Login
 ↓
JWT Access Token
 ↓
Refresh Token
 ↓
Dashboard
```

---

## 🌙 THEME SYSTEM

- Dark mode
- Light mode

Stored in:
- Database
- Local storage

---

## 📊 ANALYTICS MODULE

Metrics:
- Meetings held
- Meeting duration
- Participation
- Engagement
- Task completion
- Productivity
- AI usage
- Workspace activity

---

## 🚀 DEPLOYMENT ARCHITECTURE

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas
- Redis: Redis Cloud
- Storage: Cloudinary
- AI: OpenAI

---

## 👥 TEAM DISTRIBUTION

- Member 1: Frontend + UI
- Member 2: Backend + Database
- Member 3: WebRTC + Socket.io
- Member 4: AI + Deployment + Documentation

---

## 🏆 FINAL PRODUCT EXPERIENCE

A user should be able to:

1. Login
2. Start instant meeting
3. Invite team
4. Talk in real time
5. Get live transcript
6. Get AI summary
7. Generate tasks automatically
8. Track projects
9. View analytics
10. Export reports

All within a single platform.
