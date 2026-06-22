// Centralized shared frontend API types.
// This file intentionally contains only re-exportable minimal types required by services.

export type Meeting = {
  id: string;
  title: string;
  start?: string;
  status?: string;
};

export type Task = {
  id: string;
  title: string;
  status?: string;
  priority?: string;
  due?: string;
  assignee?: string;
  aiScore?: number;
};

export type Project = {
  id: string;
  name: string;
  progress?: number;
};

export type Notification = {
  id: string;
  userId?: string;
  type?: string;
  title: string;
  body?: string;
  read?: boolean;
};
