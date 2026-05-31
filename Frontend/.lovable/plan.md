# IntellMeet — Complete Production-Grade Frontend

Goal: ship the entire IntellMeet UI as a fully navigable, pixel-close React app. Every page from your spec exists, every button does something real, every route resolves. All data is mock data wired through a typed store so creating a task, sending a chat, scheduling a meeting, or toggling mic/camera updates the UI immediately.

Stack note: this template runs on **TanStack Start + TanStack Router** (not React Router DOM) and **Tailwind v4** + **shadcn/ui** + **Framer Motion** + **Zustand** + **TanStack Query** + **lucide-react** + **Recharts**. TanStack Router is the type-safe equivalent of React Router DOM and the right choice here — I'll use it instead of `react-router-dom`. Everything else in your stack list is used as-is.

## Route map

```
/                       Landing
/login                  Login
/signup                 Signup
/forgot-password        Forgot password

/app                    Authenticated shell (sidebar + topbar + Outlet)
  /dashboard
  /meetings
  /meetings/$id         Meeting summary (timeline, transcript, action items, export)
  /room/$id             Meeting room (video grid + controls + side panels)
  /ai-assistant         Tabs: Transcript / Summary / Action Items / Insights / Mind Map
  /projects             Kanban + overview + AI recs
  /projects/$id
  /tasks                Table + drawer + filters + AI importance
  /team                 Directory, departments, online status
  /profile              Cover + avatar + skills + history + achievements
  /analytics            Charts (Recharts)
  /reports              Meeting / Team / AI / Productivity + export
  /notifications        Filterable, mark-read
  /settings             Tabs: Profile / Workspace / Notifications / Security / Theme / Connected accounts

*                       404
```

## Design system

- Dark futuristic SaaS, glassmorphism, purple neon + blue glow, premium shadows.
- All colors as HSL semantic tokens in `src/styles.css`: `--background`, `--surface`, `--surface-glass`, `--primary` (violet), `--primary-glow`, `--accent` (cyan), `--success`, `--warning`, `--destructive`, gradients `--gradient-primary`, `--gradient-glow`, shadows `--shadow-glow`, `--shadow-elevated`.
- Full light theme tokens too, toggled via `class="dark"` on `<html>`, persisted to localStorage, animated transitions. Toggle lives in topbar, sidebar footer, and Settings → Theme.
- Components reference semantic tokens only — no raw `text-white` / `bg-black` in JSX.

## Global features

- **AppShell**: collapsible sidebar (icon-collapse), topbar with global search, notifications popover, theme toggle, avatar menu.
- **Floating AI Copilot**: bottom-right FAB on every `/app/*` page. Expands into a glassy panel with chat thread, quick actions (Summarize meeting, Generate tasks, Find docs, Create plan), scripted mock responses streamed token-by-token.
- **Command palette** (⌘K) for quick navigation and actions.
- **Toasts** for every successful action; **confirm dialogs** for destructive ones.
- **Mock auth**: login/signup forms validate with zod, set a Zustand flag, route to `/app/dashboard`. Logout returns to `/`.

## Page-by-page deliverables

1. **Landing** — Navbar, Hero (with animated AI orb visualization), Features grid, Stats counter, Trusted-by logo strip, Testimonials carousel, Pricing tiers, FAQ accordion, Footer. Get Started / Watch Demo / Login / Pricing / Resources all wired.
2. **Login / Signup / Forgot password** — Google + Microsoft OAuth-style buttons (mock), email form, remember-me, validation, loading states, links between the three.
3. **Dashboard** — Stat cards (Meetings Today, Meeting Score, Tasks Completed, Focus Time), Upcoming Meetings list, AI Meeting Summary card, AI Insights, Recent Activity, Team Productivity chart, Tasks Overview, Recent Meetings, Quick Actions. **Start Instant Meeting** CTA in hero → opens modal → generates mock id → routes to `/app/room/$id`.
4. **Meetings** — List + calendar toggle, filters, search, detail side panel, Join / Edit / Schedule / Start Instant. Schedule modal with form (title, date/time, participants, agenda).
5. **Meeting Room** — Adaptive video grid with avatar tiles, name badges, speaking indicator. Control bar: Mic, Camera, Screen Share, Raise Hand, Reactions (emoji popover), Captions toggle, Record, Leave. Right-side tabs: Chat / Participants / Transcript / AI Assistant. Leave → confirm → `/app/meetings`.
6. **AI Assistant** — Tabs Transcript / Summary / Action Items / Insights / Mind Map. Confidence score, smart tags, Q&A input that streams mock answers, meeting search.
7. **Analytics** — Recharts: Meeting Trends (area), Participation (bar), Productivity (line), Meeting Effectiveness (radial), Team Insights (heatmap-style grid), AI Recommendations panel, date range picker, Export Report.
8. **Projects** — Grid of project cards → project detail with Kanban (dnd-kit drag-and-drop), progress, AI recs, members, activity feed.
9. **Tasks** — Sortable table, multi-filter, search, pagination, row click opens Task Detail Drawer (assignee, priority, status, due date, AI importance score, comments).
10. **Meeting Summary** (`/meetings/$id`) — Timeline, transcript, highlights, action items, key decisions, metrics, comments, files, Export PDF (jsPDF), Share dialog.
11. **Team** — Directory grid with department filter, online status dots, collaboration scores, contribution bars.
12. **Profile** — Cover banner, avatar, role/department, skills chips, meeting history, assigned tasks, productivity metrics, achievements, recent activity, Edit Profile dialog.
13. **Notifications** — Filterable list (Invites, Tasks, AI, Mentions, Workspace), mark-read / mark-all-read.
14. **Reports** — Cards per report type with preview chart, Export PDF / Excel buttons (jsPDF + sheetjs).
15. **Settings** — Tabbed: Profile, Workspace, Notifications, Security (password, 2FA toggle, sessions), Theme, Connected Accounts (Google/Microsoft/Slack/Zoom mock connect).

## Reusable component library

`Button`, `Input`, `Textarea`, `Select`, `Modal/Dialog`, `Drawer`, `DataTable`, `Card`, `GlassCard`, `Avatar`, `AvatarGroup`, `Dropdown`, `Tabs`, `Sidebar`, `Topbar`, `PageHeader`, `StatCard`, `ChartCard`, `MeetingCard`, `TaskCard`, `KanbanColumn`, `ChatMessage`, `EmptyState`, `ConfirmDialog`, `FormDialog`, `AICopilotFAB`, `CommandPalette`.

## State

Zustand slices: `useAuthStore`, `useMeetingsStore`, `useTasksStore`, `useProjectsStore`, `useChatStore`, `useNotificationsStore`, `useUIStore` (theme, sidebar, modals), `useAICopilotStore`. TanStack Query wraps mock async fetchers so the data layer is swap-ready for real APIs later.

## Mock data

`src/lib/mock/*.ts` — 12+ users, 20+ meetings (mixed past/upcoming/recordings), 40+ tasks across statuses/priorities, 6 projects, 8 channels with messages, transcripts with timestamps + speakers, analytics time series, notifications, AI insights.

## Explicit non-goals (this phase)

- No real authentication, no Lovable Cloud / database, no real WebRTC, no real AI calls. Every "AI" response is scripted mock content streamed to feel live. This is a complete frontend ready for backend wiring in phase 2.

Approve and I'll build it end-to-end.