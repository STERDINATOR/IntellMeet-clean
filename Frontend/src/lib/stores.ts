import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  currentUser,
  tasks as seedTasks,
  meetings as seedMeetings,
  notifications as seedNotifications,
  projects as seedProjects,
  type Task,
  type Meeting,
  type Notification,
  type Project,
  type User,
} from "./mock";

export const useAuthStore = create<{
  isAuthed: boolean;
  user: User;
  accessToken: string | null;
  refreshToken: string | null;
  login: () => void;
  setSession: (session: {
    user?: Partial<User> & { _id?: string };
    accessToken: string;
    refreshToken: string;
  }) => void;
  logout: () => void;
}>()(
  persist(
    (set) => ({
      isAuthed: false,
      user: currentUser,
      accessToken: null,
      refreshToken: null,
      login: () =>
        set({
          isAuthed: true,
          user: currentUser,
          accessToken: `im_access_${Date.now()}`,
          refreshToken: `im_refresh_${Date.now()}`,
        }),
      setSession: ({ user, accessToken, refreshToken }) =>
        set({
          isAuthed: true,
          user: {
            ...currentUser,
            ...user,
            id: user?._id ?? user?.id ?? currentUser.id,
          } as User,
          accessToken,
          refreshToken,
        }),
      logout: () =>
        set({
          isAuthed: false,
          user: currentUser,
          accessToken: null,
          refreshToken: null,
        }),
    }),
    { name: "im-auth" },
  ),
);

export const useUIStore = create<{
  theme: "dark" | "light";
  setTheme: (t: "dark" | "light") => void;
  copilotOpen: boolean;
  setCopilotOpen: (b: boolean) => void;
  commandOpen: boolean;
  setCommandOpen: (b: boolean) => void;
}>()(
  persist(
    (set) => ({
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
    }),
    { name: "im-ui" },
  ),
);

export const useTasksStore = create<{
  tasks: Task[];
  add: (t: Omit<Task, "id">) => string;
  update: (id: string, patch: Partial<Task>) => void;
  remove: (id: string) => void;
  setStatus: (id: string, status: Task["status"]) => void;
  setTasks: (tasks: Task[]) => void;
}>()(
  persist(
    (set) => ({
      tasks: seedTasks,
      add: (t) => {
        const id = `t${Date.now()}`;
        set((s) => ({ tasks: [{ ...t, id }, ...s.tasks] }));
        return id;
      },
      update: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      remove: (id) =>
        set((s) => ({ tasks: s.tasks.filter((x) => x.id !== id) })),
      setStatus: (id, status) =>
        set((s) => ({
          tasks: s.tasks.map((x) => (x.id === id ? { ...x, status } : x)),
        })),
      setTasks: (tasks) => set({ tasks }),
    }),
    { name: "im-tasks" },
  ),
);

export const useMeetingsStore = create<{
  meetings: Meeting[];
  add: (m: Omit<Meeting, "id">) => string;
  update: (id: string, patch: Partial<Meeting>) => void;
  remove: (id: string) => void;
  setMeetings: (meetings: Meeting[]) => void;
}>()(
  persist(
    (set) => ({
      meetings: seedMeetings,
      add: (m) => {
        const id = `m${Date.now()}`;
        set((s) => ({ meetings: [{ ...m, id }, ...s.meetings] }));
        return id;
      },
      update: (id, patch) =>
        set((s) => ({
          meetings: s.meetings.map((x) =>
            x.id === id ? { ...x, ...patch } : x,
          ),
        })),
      remove: (id) =>
        set((s) => ({ meetings: s.meetings.filter((x) => x.id !== id) })),
      setMeetings: (meetings) => set({ meetings }),
    }),
    { name: "im-meetings" },
  ),
);

export const useNotificationsStore = create<{
  items: Notification[];
  add: (n: Omit<Notification, "id" | "time" | "read">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  remove: (id: string) => void;
  setNotifications: (items: Notification[]) => void;
}>()(
  persist(
    (set) => ({
      items: seedNotifications,
      add: (n) =>
        set((s) => ({
          items: [
            {
              ...n,
              id: `n${Date.now()}`,
              time: new Date().toISOString(),
              read: false,
            },
            ...s.items,
          ],
        })),
      markRead: (id) =>
        set((s) => ({
          items: s.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
      markAllRead: () =>
        set((s) => ({ items: s.items.map((n) => ({ ...n, read: true })) })),
      remove: (id) =>
        set((s) => ({ items: s.items.filter((n) => n.id !== id) })),
      setNotifications: (items) => set({ items }),
    }),
    { name: "im-notifications" },
  ),
);

export const useProjectsStore = create<{
  projects: Project[];
  add: (p: Omit<Project, "id">) => string;
  update: (id: string, patch: Partial<Project>) => void;
  setProjects: (projects: Project[]) => void;
}>()(
  persist(
    (set) => ({
      projects: seedProjects,
      add: (p) => {
        const id = `p${Date.now()}`;
        set((s) => ({ projects: [{ ...p, id }, ...s.projects] }));
        return id;
      },
      update: (id, patch) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, ...patch } : p,
          ),
        })),
      setProjects: (projects) => set({ projects }),
    }),
    { name: "im-projects" },
  ),
);
