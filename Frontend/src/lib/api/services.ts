import { apiClient } from "./client";
import { useMeetingsStore, useNotificationsStore, useProjectsStore, useTasksStore } from "@/lib/stores";
import type { Meeting, Notification, Project, Task } from "@/lib/mock";

const localFirst = async <T>(operation: () => T, remote: () => Promise<T>) => {
  try {
    return await remote();
  } catch {
    return operation();
  }
};

const normalizeRemote = <T extends { _id?: string; id?: string }>(item: T) => ({
  ...item,
  id: item.id ?? item._id?.toString() ?? "",
}) as T & { id: string };

const normalizeList = <T extends { _id?: string; id?: string }>(items: T[]) => items.map(normalizeRemote);

export const authService = {
  login: async () => localFirst(() => undefined, () => apiClient.post<void>("/auth/login")),
  logout: async () => localFirst(() => undefined, () => apiClient.post<void>("/auth/logout")),
  refresh: async () => localFirst(() => undefined, () => apiClient.post<void>("/auth/refresh")),
};

export const meetingService = {
  list: async () => localFirst(() => useMeetingsStore.getState().meetings, async () => {
    const meetings = normalizeList(await apiClient.get<Meeting[]>('/meetings'));
    useMeetingsStore.getState().setMeetings(meetings as Meeting[]);
    return meetings;
  }),
  get: async (id: string) => localFirst(() => useMeetingsStore.getState().meetings.find((m) => m.id === id), async () => normalizeRemote(await apiClient.get<Meeting>(`/meetings/${id}`))),
  create: async (meeting: Omit<Meeting, "id">) => localFirst(() => useMeetingsStore.getState().add(meeting), async () => {
    const created = normalizeRemote(await apiClient.post<Meeting>('/meetings', meeting));
    useMeetingsStore.getState().setMeetings([created as Meeting, ...useMeetingsStore.getState().meetings]);
    return created;
  }),
  update: async (id: string, patch: Partial<Meeting>) => localFirst(() => useMeetingsStore.getState().update(id, patch), async () => {
    const updated = normalizeRemote(await apiClient.patch<Meeting>(`/meetings/${id}`, patch));
    useMeetingsStore.getState().update(id, updated);
    return updated;
  }),
  remove: async (id: string) => localFirst(() => useMeetingsStore.getState().remove(id), async () => {
    await apiClient.delete<void>(`/meetings/${id}`);
    useMeetingsStore.getState().remove(id);
  }),
};

export const taskService = {
  list: async () => localFirst(() => useTasksStore.getState().tasks, async () => {
    const tasks = normalizeList(await apiClient.get<Task[]>('/tasks'));
    useTasksStore.getState().setTasks(tasks as Task[]);
    return tasks;
  }),
  get: async (id: string) => localFirst(() => useTasksStore.getState().tasks.find((t) => t.id === id), async () => normalizeRemote(await apiClient.get<Task>(`/tasks/${id}`))),
  create: async (task: Omit<Task, "id">) => localFirst(() => useTasksStore.getState().add(task), async () => {
    const created = normalizeRemote(await apiClient.post<Task>('/tasks', task));
    useTasksStore.getState().setTasks([created as Task, ...useTasksStore.getState().tasks]);
    return created;
  }),
  update: async (id: string, patch: Partial<Task>) => localFirst(() => useTasksStore.getState().update(id, patch), async () => {
    const updated = normalizeRemote(await apiClient.patch<Task>(`/tasks/${id}`, patch));
    useTasksStore.getState().update(id, updated);
    return updated;
  }),
  remove: async (id: string) => localFirst(() => useTasksStore.getState().remove(id), async () => {
    await apiClient.delete<void>(`/tasks/${id}`);
    useTasksStore.getState().remove(id);
  }),
};

export const projectService = {
  list: async () => localFirst(() => useProjectsStore.getState().projects, async () => {
    const projects = normalizeList(await apiClient.get<Project[]>('/projects'));
    useProjectsStore.getState().setProjects(projects as Project[]);
    return projects;
  }),
  get: async (id: string) => localFirst(() => useProjectsStore.getState().projects.find((p) => p.id === id), async () => normalizeRemote(await apiClient.get<Project>(`/projects/${id}`))),
  create: async (project: Omit<Project, "id">) => localFirst(() => useProjectsStore.getState().add(project), async () => {
    const created = normalizeRemote(await apiClient.post<Project>('/projects', project));
    useProjectsStore.getState().setProjects([created as Project, ...useProjectsStore.getState().projects]);
    return created;
  }),
  update: async (id: string, patch: Partial<Project>) => localFirst(() => useProjectsStore.getState().update(id, patch), async () => {
    const updated = normalizeRemote(await apiClient.patch<Project>(`/projects/${id}`, patch));
    useProjectsStore.getState().update(id, updated);
    return updated;
  }),
};

export const notificationService = {
  list: async () => localFirst(() => useNotificationsStore.getState().items, async () => {
    const notifications = normalizeList(await apiClient.get<Notification[]>('/notifications'));
    useNotificationsStore.getState().setNotifications(notifications as Notification[]);
    return notifications;
  }),
  create: async (notification: Omit<Notification, "id" | "time" | "read">) => localFirst(() => useNotificationsStore.getState().add(notification), async () => {
    const created = normalizeRemote(await apiClient.post<Notification>('/notifications', notification));
    useNotificationsStore.getState().setNotifications([created as Notification, ...useNotificationsStore.getState().items]);
    return created;
  }),
  markAllRead: async () => localFirst(() => useNotificationsStore.getState().markAllRead(), async () => {
    await apiClient.post<void>('/notifications/read-all');
    useNotificationsStore.getState().markAllRead();
  }),
  markRead: async (id: string) => localFirst(() => useNotificationsStore.getState().markRead(id), async () => {
    const updated = normalizeRemote(await apiClient.post<Notification>(`/notifications/${id}/read`));
    useNotificationsStore.getState().markRead(id);
    return updated;
  }),
  remove: async (id: string) => localFirst(() => useNotificationsStore.getState().remove(id), async () => {
    await apiClient.delete<void>(`/notifications/${id}`);
    useNotificationsStore.getState().remove(id);
  }),
};

export const aiService = {
  ask: (prompt: string) => apiClient.post<{ answer: string }>("/ai/ask", { prompt }),
  summarizeMeeting: (meetingId: string) => apiClient.post<{ summary: string }>(`/ai/meetings/${meetingId}/summary`),
};

export const analyticsService = {
  export: () => apiClient.get<Blob>("/analytics/export"),
};

export const teamService = {
  invite: (email: string, projectId?: string) => apiClient.post<void>("/team/invitations", { email, projectId }),
};

export const workspaceService = {
  update: (payload: Record<string, unknown>) => apiClient.patch<void>("/workspace", payload),
};
