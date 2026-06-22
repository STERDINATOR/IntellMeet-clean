import { apiClient, API_BASE_URL, tokenManager } from "./client";
import {
  useMeetingsStore,
  useNotificationsStore,
  useProjectsStore,
  useTasksStore,
} from "@/lib/stores";
import type { Meeting, Notification, Project, Task } from "@/lib/mock";

const normalizeRemote = <T extends { _id?: string; id?: string }>(
  item: T,
): T & { id: string } => ({
  ...item,
  id: item.id ?? item._id?.toString() ?? "",
});

const normalizeList = <T extends { _id?: string; id?: string }>(items: T[]) =>
  items.map(normalizeRemote);

export const meetingService = {
  list: async (): Promise<Meeting[]> => {
    try {
      const meetings = normalizeList(
        await apiClient.get<Meeting[]>("/meetings"),
      ) as Meeting[];
      useMeetingsStore.getState().setMeetings(meetings);
      return meetings;
    } catch {
      return useMeetingsStore.getState().meetings;
    }
  },
  get: async (id: string): Promise<Meeting | undefined> => {
    try {
      return normalizeRemote(
        await apiClient.get<Meeting>(`/meetings/${id}`),
      ) as Meeting;
    } catch {
      return useMeetingsStore.getState().meetings.find((m) => m.id === id);
    }
  },
  create: async (meeting: Omit<Meeting, "id">): Promise<Meeting> => {
    try {
      const created = normalizeRemote(
        await apiClient.post<Meeting>("/meetings", meeting),
      ) as Meeting;
      useMeetingsStore
        .getState()
        .setMeetings([created, ...useMeetingsStore.getState().meetings]);
      return created;
    } catch {
      const id = useMeetingsStore.getState().add(meeting);
      return { ...meeting, id } as Meeting;
    }
  },
  update: async (id: string, patch: Partial<Meeting>): Promise<void> => {
    try {
      await apiClient.patch<Meeting>(`/meetings/${id}`, patch);
    } catch {
      // no-op: UI state still updated below
    }
    useMeetingsStore.getState().update(id, patch);
  },
  remove: async (id: string): Promise<void> => {
    try {
      await apiClient.delete<void>(`/meetings/${id}`);
    } catch {
      // no-op
    }
    useMeetingsStore.getState().remove(id);
  },
};

export const taskService = {
  list: async (): Promise<Task[]> => {
    try {
      const tasks = normalizeList(
        await apiClient.get<Task[]>("/tasks"),
      ) as Task[];
      useTasksStore.getState().setTasks(tasks);
      return tasks;
    } catch {
      return useTasksStore.getState().tasks;
    }
  },
  get: async (id: string): Promise<Task | undefined> => {
    try {
      return normalizeRemote(await apiClient.get<Task>(`/tasks/${id}`)) as Task;
    } catch {
      return useTasksStore.getState().tasks.find((t) => t.id === id);
    }
  },
  create: async (task: Omit<Task, "id">): Promise<Task> => {
    try {
      const created = normalizeRemote(
        await apiClient.post<Task>("/tasks", task),
      ) as Task;
      useTasksStore
        .getState()
        .setTasks([created, ...useTasksStore.getState().tasks]);
      return created;
    } catch {
      const id = useTasksStore.getState().add(task);
      return { ...task, id } as Task;
    }
  },
  update: async (id: string, patch: Partial<Task>): Promise<void> => {
    try {
      await apiClient.patch<Task>(`/tasks/${id}`, patch);
    } catch {
      // no-op
    }
    useTasksStore.getState().update(id, patch);
  },
  remove: async (id: string): Promise<void> => {
    try {
      await apiClient.delete<void>(`/tasks/${id}`);
    } catch {
      // no-op
    }
    useTasksStore.getState().remove(id);
  },
};

export const projectService = {
  list: async (): Promise<Project[]> => {
    try {
      const projects = normalizeList(
        await apiClient.get<Project[]>("/projects"),
      ) as Project[];
      useProjectsStore.getState().setProjects(projects);
      return projects;
    } catch {
      return useProjectsStore.getState().projects;
    }
  },
  get: async (id: string): Promise<Project | undefined> => {
    try {
      return normalizeRemote(
        await apiClient.get<Project>(`/projects/${id}`),
      ) as Project;
    } catch {
      return useProjectsStore.getState().projects.find((p) => p.id === id);
    }
  },
  create: async (project: Omit<Project, "id">): Promise<Project> => {
    try {
      const created = normalizeRemote(
        await apiClient.post<Project>("/projects", project),
      ) as Project;
      useProjectsStore
        .getState()
        .setProjects([created, ...useProjectsStore.getState().projects]);
      return created;
    } catch {
      const id = useProjectsStore.getState().add(project);
      return { ...project, id } as Project;
    }
  },
  update: async (id: string, patch: Partial<Project>): Promise<void> => {
    try {
      await apiClient.patch<Project>(`/projects/${id}`, patch);
    } catch {
      // no-op
    }
    useProjectsStore.getState().update(id, patch);
  },
};

export const notificationService = {
  list: async (): Promise<Notification[]> => {
    try {
      const items = normalizeList(
        await apiClient.get<Notification[]>("/notifications"),
      ) as Notification[];
      useNotificationsStore.getState().setNotifications(items);
      return items;
    } catch {
      return useNotificationsStore.getState().items;
    }
  },
  create: async (
    notification: Omit<Notification, "id" | "time" | "read">,
  ): Promise<void> => {
    try {
      const created = normalizeRemote(
        await apiClient.post<Notification>("/notifications", notification),
      ) as Notification;
      useNotificationsStore
        .getState()
        .setNotifications([created, ...useNotificationsStore.getState().items]);
    } catch {
      useNotificationsStore.getState().add(notification);
    }
  },
  markAllRead: async (): Promise<void> => {
    try {
      await apiClient.post<void>("/notifications/read-all");
    } catch {
      // no-op
    }
    useNotificationsStore.getState().markAllRead();
  },
  markRead: async (id: string): Promise<void> => {
    try {
      await apiClient.post<Notification>(`/notifications/${id}/read`);
    } catch {
      // no-op
    }
    useNotificationsStore.getState().markRead(id);
  },
  remove: async (id: string): Promise<void> => {
    try {
      await apiClient.delete<void>(`/notifications/${id}`);
    } catch {
      // no-op
    }
    useNotificationsStore.getState().remove(id);
  },
};

export const aiService = {
  extractActionItems: async (meetingId: string): Promise<Task[]> => {
    const tasks = normalizeList(
      await apiClient.post<Task[]>(`/ai/meetings/${meetingId}/action-items`),
    ) as Task[];
    useTasksStore
      .getState()
      .setTasks([...tasks, ...useTasksStore.getState().tasks]);
    return tasks;
  },
};

export const transcriptService = {
  list: (meetingId: string) =>
    apiClient.get<
      Array<{
        _id?: string;
        id?: string;
        speaker: string;
        text: string;
        atSeconds: number;
      }>
    >(`/meetings/${meetingId}/transcripts`),
  create: (
    meetingId: string,
    transcript: { speaker: string; text: string; atSeconds: number },
  ) => apiClient.post(`/meetings/${meetingId}/transcripts`, transcript),
};

export const analyticsService = {
  recentActivity: () =>
    apiClient.get<
      Array<{
        id: string;
        actor: { id: string; name: string; avatar?: string };
        eventType: string;
        resourceType?: string;
        resourceId?: string;
        time: string;
      }>
    >("/analytics/recent-activity"),
  dashboard: () =>
    apiClient.get<{
      meetingTrends: Array<{ month: string; meetings: number; focus: number }>;
      productivity: Array<{ day: string; score: number }>;
      effectiveness: Array<{ name: string; value: number }>;
      participation: Array<{ name: string; value: number }>;
      aiRecommendations: string[];
    }>("/analytics/dashboard"),
  exportCsv: async (): Promise<void> => {
    const token = tokenManager.getAccessToken();
    const res = await fetch(`${API_BASE_URL}/analytics/export`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error("Export failed");
    const text = await res.text();
    const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "intellmeet-analytics.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};

export const teamService = {
  invite: (email: string, projectId?: string) =>
    apiClient.post<void>("/team/invitations", { email, projectId }),
};

export const workspaceService = {
  get: () =>
    apiClient.get<{ _id: string; name: string; slug: string; plan: string }>(
      "/workspace",
    ),
  update: (payload: Record<string, unknown>) =>
    apiClient.patch<void>("/workspace", payload),
};

type UserDTO = {
  id: string;
  name?: string;
  avatar?: string;
  role?: string;
  department?: string;
};

type PresenceDTO = {
  userId: string;
  online?: boolean;
  name?: string;
};

type AuditLogDTO = {
  id: string;
  actor?: { id: string; name?: string; avatar?: string };
  eventType: string;
  resourceType?: string;
  resourceId?: string;
  time: string;
};

type ChatMessageDTO = {
  id: string;
  userId?: string;
  name?: string;
  text: string;
  createdAt?: string;
};

export const userService = {
  list: () => apiClient.get<UserDTO[]>("/users"),
  updateMe: (patch: { name?: string; department?: string; avatar?: string }) =>
    apiClient.patch<UserDTO>("/users/me", patch),
  getPresence: () => apiClient.get<PresenceDTO[]>("/presence"),
};

export const auditService = {
  list: (page = 0, limit = 50) =>
    apiClient.get<{
      logs: AuditLogDTO[];
      total: number;
      page: number;
      limit: number;
    }>(`/audit-logs?page=${page}&limit=${limit}`),
};

export const chatService = {
  history: (roomId: string) =>
    apiClient.get<ChatMessageDTO[]>(`/chat/${roomId}`),
};
