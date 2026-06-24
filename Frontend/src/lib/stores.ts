import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  Meeting,
  Notification,
  Project,
  Task,
  User,
} from "@/lib/api/domain";

const emptyUser = {
  id: "",
  name: "",
  email: "",
  avatar: "",
  role: "",
  department: "",
  online: false,
} satisfies User;

// ─────────────────────────────────────────────────────────────────────────────
// Auth (persisted)
// ─────────────────────────────────────────────────────────────────────────────

type AuthSession = {
  user?: Partial<User> & { _id?: string };
  accessToken: string;
  refreshToken: string;
};

type AuthState = {
  isAuthed: boolean;
  user: User;
  accessToken: string | null;
  refreshToken: string | null;
  login: () => void;
  setSession: (session: AuthSession) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthed: false,
      user: emptyUser,
      accessToken: null,
      refreshToken: null,
      login: () => {
        // UI-only placeholder
      },
      setSession: ({ user, accessToken, refreshToken }) =>
        set(() => ({
          isAuthed: true,
          user: {
            ...emptyUser,
            ...user,
            id: user?._id ?? user?.id ?? emptyUser.id,
          } as User,
          accessToken,
          refreshToken,
        })),
      logout: () =>
        set(() => ({
          isAuthed: false,
          user: emptyUser,
          accessToken: null,
          refreshToken: null,
        })),
    }),
    {
      name: "im-auth",
      version: 1,
      partialize: (state) => ({
        isAuthed: state.isAuthed,
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);

// ─────────────────────────────────────────────────────────────────────────────
// UI (non-persisted)
// ─────────────────────────────────────────────────────────────────────────────

export const useUIStore = create<{
  theme: "dark" | "light";
  setTheme: (t: "dark" | "light") => void;
  copilotOpen: boolean;
  setCopilotOpen: (b: boolean) => void;
  commandOpen: boolean;
  setCommandOpen: (b: boolean) => void;
}>(() => ({
  theme: "dark",
  setTheme: (theme) => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("light", theme === "light");
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
    return { theme } as const;
  },
  copilotOpen: false,
  setCopilotOpen: (copilotOpen) => ({ copilotOpen }) as const,
  commandOpen: false,
  setCommandOpen: (commandOpen) => ({ commandOpen }) as const,
}));

// ─────────────────────────────────────────────────────────────────────────────
// Tasks
// ─────────────────────────────────────────────────────────────────────────────

export const useTasksStore = create<{
  tasks: Task[];
  update: (id: string, patch: Partial<Task>) => void;
  remove: (id: string) => void;
  setStatus: (id: string, status: Task["status"]) => void;
  setTasks: (tasks: Task[]) => void;
}>(() => ({
  tasks: [],
  setTasks: (tasks) => ({ tasks }) as const,
  update: (id, patch) =>
    ({
      tasks: useTasksStore
        .getState()
        .tasks.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }) as const,
  remove: (id) =>
    ({
      tasks: useTasksStore.getState().tasks.filter((x) => x.id !== id),
    }) as const,
  setStatus: (id, status) =>
    ({
      tasks: useTasksStore
        .getState()
        .tasks.map((x) => (x.id === id ? { ...x, status } : x)),
    }) as const,
}));

// ─────────────────────────────────────────────────────────────────────────────
// Meetings
// ─────────────────────────────────────────────────────────────────────────────

export const useMeetingsStore = create<{
  meetings: Meeting[];
  update: (id: string, patch: Partial<Meeting>) => void;
  remove: (id: string) => void;
  setMeetings: (meetings: Meeting[]) => void;
}>(() => ({
  meetings: [],
  setMeetings: (meetings) => ({ meetings }) as const,
  update: (id, patch) =>
    ({
      meetings: useMeetingsStore
        .getState()
        .meetings.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }) as const,
  remove: (id) =>
    ({
      meetings: useMeetingsStore.getState().meetings.filter((x) => x.id !== id),
    }) as const,
}));

// ─────────────────────────────────────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────────────────────────────────────

export const useNotificationsStore = create<{
  items: Notification[];
  markRead: (id: string) => void;
  markAllRead: () => void;
  remove: (id: string) => void;
  setNotifications: (items: Notification[]) => void;
}>(() => ({
  items: [],
  setNotifications: (items) => ({ items }) as const,
  markRead: (id) =>
    ({
      items: useNotificationsStore
        .getState()
        .items.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }) as const,
  markAllRead: () =>
    ({
      items: useNotificationsStore
        .getState()
        .items.map((n) => ({ ...n, read: true })),
    }) as const,
  remove: (id) =>
    ({
      items: useNotificationsStore.getState().items.filter((n) => n.id !== id),
    }) as const,
}));

// ─────────────────────────────────────────────────────────────────────────────
// Projects
// ─────────────────────────────────────────────────────────────────────────────

export const useProjectsStore = create<{
  projects: Project[];
  update: (id: string, patch: Partial<Project>) => void;
  setProjects: (projects: Project[]) => void;
}>(() => ({
  projects: [],
  setProjects: (projects) => ({ projects }) as const,
  update: (id, patch) =>
    ({
      projects: useProjectsStore
        .getState()
        .projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }) as const,
}));
