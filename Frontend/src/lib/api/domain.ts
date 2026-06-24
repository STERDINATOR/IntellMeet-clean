// Domain types ONLY (no mock data). Keep this file free of sample datasets.

export type User = {
  id: string;
  name?: string;
  email?: string;
  avatar?: string;
  role?: string;
  department?: string;
  online?: boolean;
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
  description?: string;
  progress?: number;
  members?: string[];
  color?: string;
  due?: string;
};

export type Notification = {
  id: string;
  type: "meeting" | "task" | "mention" | "ai" | "workspace";
  title: string;
  body: string;
  time: string;
  read: boolean;
};

export type ChatMsg = {
  id: string;
  user: string;
  text: string;
  time: string;
};
