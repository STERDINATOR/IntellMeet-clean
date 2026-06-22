export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: string;
  online: boolean;
};
export type Meeting = {
  id: string;
  title: string;
  start: string;
  duration: number;
  status: "upcoming" | "live" | "ended";
  participants: string[];
  host: string;
  type: "Team" | "Client" | "1:1" | "All-hands";
  agenda?: string;
  score?: number;
};
export type Task = {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  assignee: string;
  due: string;
  project: string;
  aiScore: number;
  tags: string[];
};
export type Project = {
  id: string;
  name: string;
  description: string;
  progress: number;
  members: string[];
  color: string;
  due: string;
};
export type ChatMsg = { id: string; user: string; text: string; time: string };
export type Channel = { id: string; name: string; unread: number };
export type Notification = {
  id: string;
  type: "meeting" | "task" | "mention" | "ai" | "workspace";
  title: string;
  body: string;
  time: string;
  read: boolean;
};

const avatar = (seed: string) =>
  `https://api.dicebear.com/9.x/glass/svg?seed=${seed}`;

export const users: User[] = [
  {
    id: "u1",
    name: "Aria Chen",
    email: "aria@intellmeet.io",
    avatar: avatar("aria"),
    role: "Product Lead",
    department: "Product",
    online: true,
  },
  {
    id: "u2",
    name: "Noah Patel",
    email: "noah@intellmeet.io",
    avatar: avatar("noah"),
    role: "Engineering Manager",
    department: "Engineering",
    online: true,
  },
  {
    id: "u3",
    name: "Maya Rivera",
    email: "maya@intellmeet.io",
    avatar: avatar("maya"),
    role: "Design Director",
    department: "Design",
    online: false,
  },
  {
    id: "u4",
    name: "Ethan Cole",
    email: "ethan@intellmeet.io",
    avatar: avatar("ethan"),
    role: "Sr. Engineer",
    department: "Engineering",
    online: true,
  },
  {
    id: "u5",
    name: "Sophia Kim",
    email: "sophia@intellmeet.io",
    avatar: avatar("sophia"),
    role: "Data Scientist",
    department: "AI",
    online: true,
  },
  {
    id: "u6",
    name: "Liam Park",
    email: "liam@intellmeet.io",
    avatar: avatar("liam"),
    role: "Marketing Lead",
    department: "Marketing",
    online: false,
  },
  {
    id: "u7",
    name: "Olivia Wu",
    email: "olivia@intellmeet.io",
    avatar: avatar("olivia"),
    role: "CFO",
    department: "Finance",
    online: true,
  },
  {
    id: "u8",
    name: "Jonas Weber",
    email: "jonas@intellmeet.io",
    avatar: avatar("jonas"),
    role: "Sales Director",
    department: "Sales",
    online: false,
  },
  {
    id: "u9",
    name: "Amara Singh",
    email: "amara@intellmeet.io",
    avatar: avatar("amara"),
    role: "Researcher",
    department: "AI",
    online: true,
  },
  {
    id: "u10",
    name: "Diego Lopez",
    email: "diego@intellmeet.io",
    avatar: avatar("diego"),
    role: "DevOps",
    department: "Engineering",
    online: true,
  },
  {
    id: "u11",
    name: "Hana Tanaka",
    email: "hana@intellmeet.io",
    avatar: avatar("hana"),
    role: "Product Designer",
    department: "Design",
    online: false,
  },
  {
    id: "u12",
    name: "Marcus Bell",
    email: "marcus@intellmeet.io",
    avatar: avatar("marcus"),
    role: "Customer Success",
    department: "Success",
    online: true,
  },
];

export const currentUser: User = {
  id: "me",
  name: "Alex Morgan",
  email: "alex@intellmeet.io",
  avatar: avatar("alex-morgan"),
  role: "Founder",
  department: "Executive",
  online: true,
};

const now = Date.now();
const hrs = (h: number) => new Date(now + h * 3600_000).toISOString();

export const meetings: Meeting[] = [
  {
    id: "m1",
    title: "Q4 Product Strategy",
    start: hrs(1),
    duration: 60,
    status: "upcoming",
    participants: ["u1", "u2", "u3", "u5"],
    host: "u1",
    type: "Team",
    agenda: "Roadmap review, OKRs, blockers",
    score: 0,
  },
  {
    id: "m2",
    title: "Engineering Standup",
    start: hrs(3),
    duration: 30,
    status: "upcoming",
    participants: ["u2", "u4", "u10", "u5"],
    host: "u2",
    type: "Team",
    score: 0,
  },
  {
    id: "m3",
    title: "Acme Corp — Demo",
    start: hrs(5),
    duration: 45,
    status: "upcoming",
    participants: ["u8", "u1", "u12"],
    host: "u8",
    type: "Client",
    score: 0,
  },
  {
    id: "m4",
    title: "Design Critique",
    start: hrs(-2),
    duration: 60,
    status: "ended",
    participants: ["u3", "u11", "u1"],
    host: "u3",
    type: "Team",
    score: 88,
  },
  {
    id: "m5",
    title: "AI Research Sync",
    start: hrs(-5),
    duration: 45,
    status: "ended",
    participants: ["u5", "u9", "u2"],
    host: "u5",
    type: "Team",
    score: 94,
  },
  {
    id: "m6",
    title: "All-hands — Town Hall",
    start: hrs(26),
    duration: 60,
    status: "upcoming",
    participants: users.slice(0, 10).map((u) => u.id),
    host: "u1",
    type: "All-hands",
    score: 0,
  },
  {
    id: "m7",
    title: "1:1 with Noah",
    start: hrs(-24),
    duration: 30,
    status: "ended",
    participants: ["u2"],
    host: "me",
    type: "1:1",
    score: 91,
  },
  {
    id: "m8",
    title: "Marketing Launch Plan",
    start: hrs(-30),
    duration: 60,
    status: "ended",
    participants: ["u6", "u1", "u11"],
    host: "u6",
    type: "Team",
    score: 82,
  },
  {
    id: "m9",
    title: "Finance Review",
    start: hrs(48),
    duration: 45,
    status: "upcoming",
    participants: ["u7", "u1"],
    host: "u7",
    type: "Team",
    score: 0,
  },
  {
    id: "m10",
    title: "Partner Sync — Globex",
    start: hrs(72),
    duration: 30,
    status: "upcoming",
    participants: ["u8", "u12"],
    host: "u8",
    type: "Client",
    score: 0,
  },
];

export const projects: Project[] = [
  {
    id: "p1",
    name: "Atlas Platform",
    description: "Next-gen meeting intelligence core",
    progress: 68,
    members: ["u2", "u4", "u5", "u10"],
    color: "from-violet-500 to-fuchsia-500",
    due: hrs(24 * 30),
  },
  {
    id: "p2",
    name: "Aurora Design System",
    description: "Unified design language and tokens",
    progress: 42,
    members: ["u3", "u11"],
    color: "from-cyan-400 to-sky-500",
    due: hrs(24 * 45),
  },
  {
    id: "p3",
    name: "Pulse Analytics",
    description: "Realtime workspace analytics",
    progress: 81,
    members: ["u5", "u9", "u4"],
    color: "from-emerald-400 to-teal-500",
    due: hrs(24 * 14),
  },
  {
    id: "p4",
    name: "Helios Marketing",
    description: "Q4 GTM campaign",
    progress: 23,
    members: ["u6", "u1"],
    color: "from-amber-400 to-orange-500",
    due: hrs(24 * 60),
  },
  {
    id: "p5",
    name: "Nimbus Mobile",
    description: "iOS + Android client",
    progress: 55,
    members: ["u4", "u10", "u3"],
    color: "from-rose-400 to-pink-500",
    due: hrs(24 * 40),
  },
  {
    id: "p6",
    name: "Orion Security",
    description: "SOC2 + enterprise SSO",
    progress: 90,
    members: ["u10", "u2"],
    color: "from-indigo-400 to-blue-500",
    due: hrs(24 * 7),
  },
];

const tts = [
  "roadmap",
  "frontend",
  "ai",
  "bug",
  "infra",
  "design",
  "copy",
  "launch",
  "research",
  "review",
];
export const tasks: Task[] = Array.from({ length: 42 }).map((_, i) => {
  const statuses: Task["status"][] = ["todo", "in_progress", "review", "done"];
  const prios: Task["priority"][] = ["low", "medium", "high", "urgent"];
  return {
    id: `t${i + 1}`,
    title:
      [
        "Refactor meeting room WebRTC layer",
        "Ship transcript search UI",
        "Draft Q4 OKR doc",
        "Investigate dashboard p95 latency",
        "Redesign empty states",
        "Onboarding flow A/B test",
        "Add AI action items panel",
        "Fix sidebar collapse animation",
        "Wire calendar import",
        "Implement role-based access",
        "Polish landing page hero",
        "Write API docs",
      ][i % 12] + ` #${i + 1}`,
    description:
      "Auto-generated detail for this task. Includes acceptance criteria, attachments, and discussion thread.",
    status: statuses[i % 4],
    priority: prios[i % 4],
    assignee: users[i % users.length].id,
    due: hrs(24 * ((i % 14) - 3)),
    project: projects[i % projects.length].id,
    aiScore: 40 + ((i * 13) % 60),
    tags: [tts[i % tts.length], tts[(i + 3) % tts.length]],
  };
});

export const channels: Channel[] = [
  { id: "c1", name: "general", unread: 3 },
  { id: "c2", name: "engineering", unread: 0 },
  { id: "c3", name: "design", unread: 1 },
  { id: "c4", name: "ai-research", unread: 7 },
  { id: "c5", name: "sales", unread: 0 },
  { id: "c6", name: "random", unread: 0 },
];

export const messagesByChannel: Record<string, ChatMsg[]> = {
  c1: [
    {
      id: "x1",
      user: "u1",
      text: "Morning team — drop your wins from yesterday ☀️",
      time: hrs(-6),
    },
    {
      id: "x2",
      user: "u2",
      text: "Shipped the new transcript pipeline. 30% faster.",
      time: hrs(-5.5),
    },
    {
      id: "x3",
      user: "u5",
      text: "AI summary quality jumped to 94% on internal eval.",
      time: hrs(-5),
    },
  ],
  c4: [
    {
      id: "y1",
      user: "u9",
      text: "New mind-map model checkpoint pushed.",
      time: hrs(-2),
    },
    {
      id: "y2",
      user: "u5",
      text: "Eval looks 🔥. Let's roll to staging.",
      time: hrs(-1.5),
    },
  ],
};

export const notifications: Notification[] = [
  {
    id: "n1",
    type: "meeting",
    title: "Q4 Product Strategy starts in 1h",
    body: "Hosted by Aria Chen",
    time: hrs(-0.2),
    read: false,
  },
  {
    id: "n2",
    type: "task",
    title: "Noah assigned you a task",
    body: "Refactor meeting room WebRTC layer",
    time: hrs(-1),
    read: false,
  },
  {
    id: "n3",
    type: "ai",
    title: "AI summary ready",
    body: "Design Critique — 12 highlights, 4 action items",
    time: hrs(-2),
    read: false,
  },
  {
    id: "n4",
    type: "mention",
    title: "Maya mentioned you in #design",
    body: "@alex can you review the new tokens?",
    time: hrs(-3),
    read: true,
  },
  {
    id: "n5",
    type: "workspace",
    title: "New member joined",
    body: "Marcus Bell joined Customer Success",
    time: hrs(-22),
    read: true,
  },
  {
    id: "n6",
    type: "ai",
    title: "Weekly digest",
    body: "Your focus time grew 18% this week",
    time: hrs(-26),
    read: true,
  },
];

export const transcriptSample = [
  {
    t: "00:00",
    speaker: "Aria Chen",
    text: "Welcome everyone — let's kick off with a quick recap of last week.",
  },
  {
    t: "00:18",
    speaker: "Noah Patel",
    text: "Engineering hit all milestones. The transcript service is in staging.",
  },
  {
    t: "00:42",
    speaker: "Maya Rivera",
    text: "Design finalized the new dashboard tokens. Aurora v2 is ready.",
  },
  {
    t: "01:05",
    speaker: "Sophia Kim",
    text: "AI summarization accuracy is up to 94% on internal eval sets.",
  },
  {
    t: "01:30",
    speaker: "Aria Chen",
    text: "Great. Let's lock the Q4 roadmap by Friday and move on to risks.",
  },
  {
    t: "02:02",
    speaker: "Noah Patel",
    text: "Main risk is the WebRTC SFU migration — needs a feature flag rollout.",
  },
  {
    t: "02:25",
    speaker: "Aria Chen",
    text: "Agreed. Sophia, can you own the AI eval dashboard for next week?",
  },
  {
    t: "02:40",
    speaker: "Sophia Kim",
    text: "Yes, I'll have a draft by Wednesday.",
  },
];

export const analytics = {
  meetingTrends: Array.from({ length: 12 }).map((_, i) => ({
    month: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ][i],
    meetings: 20 + ((i * 7) % 30) + 10,
    focus: 30 + ((i * 5) % 25),
  })),
  participation: users.slice(0, 8).map((u, i) => ({
    name: u.name.split(" ")[0],
    value: 40 + ((i * 13) % 50),
  })),
  productivity: Array.from({ length: 7 }).map((_, i) => ({
    day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
    tasks: 4 + ((i * 3) % 9),
    score: 60 + ((i * 7) % 30),
  })),
  effectiveness: [{ name: "Score", value: 87, fill: "var(--primary)" }],
};

export const aiInsights = [
  {
    id: "i1",
    title: "Your team spends 23% of meetings on status updates",
    impact: "Consider async standups",
    severity: "warning" as const,
  },
  {
    id: "i2",
    title: "Decision velocity improved 31% this month",
    impact: "Keep the new agenda template",
    severity: "success" as const,
  },
  {
    id: "i3",
    title: "3 meetings have no clear owner",
    impact: "Assign hosts before Friday",
    severity: "warning" as const,
  },
];

export const recentActivity = [
  {
    id: "a1",
    user: "u2",
    action: "completed task",
    target: "Refactor WebRTC layer",
    time: hrs(-0.5),
  },
  {
    id: "a2",
    user: "u5",
    action: "shared insights from",
    target: "AI Research Sync",
    time: hrs(-1),
  },
  {
    id: "a3",
    user: "u3",
    action: "uploaded design for",
    target: "Aurora v2",
    time: hrs(-2),
  },
  {
    id: "a4",
    user: "u8",
    action: "scheduled",
    target: "Acme Corp Demo",
    time: hrs(-3),
  },
];

export const findUser = (id: string) =>
  id === "me" ? currentUser : (users.find((u) => u.id === id) ?? users[0]);
