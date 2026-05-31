import { create } from "zustand";
import { persist } from "zustand/middleware";
import { tasks as seedTasks, meetings as seedMeetings, notifications as seedNotifications, projects as seedProjects, type Task, type Meeting, type Notification, type Project } from "./mock";

export const useAuthStore = create<{
  isAuthed: boolean;
  login: () => void;
  logout: () => void;
}>()(persist((set) => ({
  isAuthed: false,
  login: () => set({ isAuthed: true }),
  logout: () => set({ isAuthed: false }),
}), { name: "im-auth" }));

export const useUIStore = create<{
  theme: "dark" | "light";
  setTheme: (t: "dark" | "light") => void;
  copilotOpen: boolean;
  setCopilotOpen: (b: boolean) => void;
  commandOpen: boolean;
  setCommandOpen: (b: boolean) => void;
}>()(persist((set) => ({
  theme: "dark",
  setTheme: (theme) => {
    set({ theme });
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("light", theme === "light");
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  },
  copilotOpen: false,
  setCopilotOpen: (copilotOpen) => set({ copilotOpen }),
  commandOpen: false,
  setCommandOpen: (commandOpen) => set({ commandOpen }),
}), { name: "im-ui" }));

export const useTasksStore = create<{
  tasks: Task[];
  add: (t: Omit<Task,"id">) => void;
  update: (id: string, patch: Partial<Task>) => void;
  remove: (id: string) => void;
  setStatus: (id: string, status: Task["status"]) => void;
}>((set) => ({
  tasks: seedTasks,
  add: (t) => set((s) => ({ tasks: [{ ...t, id: `t${Date.now()}` }, ...s.tasks] })),
  update: (id, patch) => set((s) => ({ tasks: s.tasks.map(x => x.id === id ? { ...x, ...patch } : x) })),
  remove: (id) => set((s) => ({ tasks: s.tasks.filter(x => x.id !== id) })),
  setStatus: (id, status) => set((s) => ({ tasks: s.tasks.map(x => x.id === id ? { ...x, status } : x) })),
}));

export const useMeetingsStore = create<{
  meetings: Meeting[];
  add: (m: Omit<Meeting,"id">) => string;
  remove: (id: string) => void;
}>((set) => ({
  meetings: seedMeetings,
  add: (m) => {
    const id = `m${Date.now()}`;
    set((s) => ({ meetings: [{ ...m, id }, ...s.meetings] }));
    return id;
  },
  remove: (id) => set((s) => ({ meetings: s.meetings.filter(x => x.id !== id) })),
}));

export const useNotificationsStore = create<{
  items: Notification[];
  markRead: (id: string) => void;
  markAllRead: () => void;
}>((set) => ({
  items: seedNotifications,
  markRead: (id) => set((s) => ({ items: s.items.map(n => n.id === id ? { ...n, read: true } : n) })),
  markAllRead: () => set((s) => ({ items: s.items.map(n => ({ ...n, read: true })) })),
}));

export const useProjectsStore = create<{ projects: Project[] }>(() => ({ projects: seedProjects }));
