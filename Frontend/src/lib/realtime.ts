import { create } from "zustand";
import { io, type Socket } from "socket.io-client";
import { tokenManager } from "@/lib/api/client";

type RealtimeStatus = "offline" | "connecting" | "online" | "reconnecting";
type EventHandler<T = unknown> = (payload: T) => void;

class RealtimeBus {
  private target = new EventTarget();
  emit<T>(event: string, payload: T) {
    this.target.dispatchEvent(new CustomEvent(event, { detail: payload }));
  }
  on<T>(event: string, handler: EventHandler<T>) {
    const wrapped = (e: Event) => handler((e as CustomEvent<T>).detail);
    this.target.addEventListener(event, wrapped);
    return () => this.target.removeEventListener(event, wrapped);
  }
}

export const realtimeBus = new RealtimeBus();

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:4000";
let socket: Socket | null = null;
let currentToken: string | null = null;

const hasBrowser = () =>
  typeof window !== "undefined" && typeof navigator !== "undefined";

export const useSocketStore = create<{
  status: RealtimeStatus;
  onlineUserIds: string[];
  lastEventAt: string | null;
  setStatus: (s: RealtimeStatus) => void;
  setOnlineUserIds: (ids: string[]) => void;
  setUserOnline: (userId: string, online: boolean) => void;
  touch: () => void;
}>((set) => ({
  status: hasBrowser() && navigator.onLine ? "online" : "offline",
  onlineUserIds: [],
  lastEventAt: null,
  setStatus: (status) => set({ status }),
  setOnlineUserIds: (onlineUserIds) => set({ onlineUserIds }),
  setUserOnline: (userId, online) =>
    set((s) => ({
      onlineUserIds: online
        ? Array.from(new Set([...s.onlineUserIds, userId]))
        : s.onlineUserIds.filter((id) => id !== userId),
    })),
  touch: () => set({ lastEventAt: new Date().toISOString() }),
}));

// All socket events that get forwarded to the realtimeBus
const FORWARDED_EVENTS = [
  // Meetings
  "meeting:created",
  "meeting:updated",
  "meeting:deleted",
  "meeting:started",
  "meeting:ended",
  "meeting:peer-joined",
  "meeting:peer-left",
  "meeting:existing-peers",
  "meeting:control",
  "meeting:reaction",
  // WebRTC
  "webrtc:offer",
  "webrtc:answer",
  "webrtc:ice-candidate",
  // Chat
  "chat:message",
  "chat:edited",
  "chat:deleted",
  "typing:start",
  "typing:stop",
  // Transcript
  "transcript:created",
  "transcript:updated",
  // Tasks
  "task:created",
  "task:updated",
  "task:completed",
  "task:deleted",
  "task:bulk_created",
  // Projects
  "project:created",
  "project:updated",
  "project:deleted",
  // Notifications
  "notification:created",
  "notification:updated",
  "notification:deleted",
  "notification:all-read",
  "notification:bulk",
  // Presence
  "presence:changed",
  // AI
  "ai:summary_generated",
  "ai:actionitems_generated",
  "ai:sentiment_updated",
  "ai:insights_updated",
  "ai:transcript_updated",
  // Analytics
  "analytics:updated",
  "dashboard:updated",
  // Workspace / User
  "workspace:updated",
  "user:updated",
];

export function connectRealtime() {
  if (!hasBrowser()) return () => {};

  const store = useSocketStore.getState();
  store.setStatus("connecting");
  const token = tokenManager.getAccessToken();

  if (!token) {
    if (socket) {
      socket.disconnect();
      socket = null;
      currentToken = null;
    }
    store.setStatus(navigator.onLine ? "online" : "offline");
    return () => {};
  }

  if (socket && currentToken === token) {
    if (!socket.connected) socket.connect();
    store.setStatus(socket.connected ? "online" : "reconnecting");
    return () => {};
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  });
  currentToken = token;

  socket.on("connect", () => {
    useSocketStore.getState().setStatus("online");
  });

  socket.on("disconnect", () => {
    useSocketStore
      .getState()
      .setStatus(navigator.onLine ? "reconnecting" : "offline");
  });

  socket.on("connect_error", () => {
    useSocketStore.getState().setStatus("offline");
  });

  socket.on("reconnect", () => {
    useSocketStore.getState().setStatus("online");
  });

  // Forward all domain events through the bus
  FORWARDED_EVENTS.forEach((event) => {
    socket?.on(event, (payload) => {
      realtimeBus.emit(event, payload);
      useSocketStore.getState().touch();
    });
  });

  // Presence tracking
  socket.on(
    "presence:changed",
    (payload: { userId: string; online?: boolean }) => {
      if (typeof payload.online === "boolean") {
        useSocketStore.getState().setUserOnline(payload.userId, payload.online);
      }
    },
  );

  const online = () => useSocketStore.getState().setStatus("online");
  const offline = () => useSocketStore.getState().setStatus("offline");
  window.addEventListener("online", online);
  window.addEventListener("offline", offline);

  return () => {
    window.removeEventListener("online", online);
    window.removeEventListener("offline", offline);
  };
}

export const socketClient = {
  get: () => socket,
  emit: (event: string, payload?: unknown) => {
    if (socket?.connected) socket.emit(event, payload);
    realtimeBus.emit(event, payload);
  },
  on: <T>(event: string, handler: EventHandler<T>) => {
    const offLocal = realtimeBus.on(event, handler);
    socket?.on(event, handler as never);
    return () => {
      offLocal();
      socket?.off(event, handler as never);
    };
  },
  disconnect: () => {
    socket?.disconnect();
    socket = null;
    currentToken = null;
    useSocketStore.getState().setStatus("offline");
  },
};

export function useSocketEvent<T>(event: string, handler: EventHandler<T>) {
  return realtimeBus.on(event, (payload: T) => {
    useSocketStore.getState().touch();
    handler(payload);
  });
}

// ─── Global store synchronization ────────────────────────────────────────────
// Wire all backend events → Zustand stores. Call once after login.
import {
  useMeetingsStore,
  useTasksStore,
  useProjectsStore,
  useNotificationsStore,
} from "@/lib/stores";

export function startGlobalRealtimeSync() {
  type DocWithId = { id?: string; _id?: unknown } & Record<string, unknown>;

  // Keep normalization type-safe-ish by returning the specific domain shape when possible.
  // Backend payloads vary; for UI stores we only require the full domain fields.
  const normalize = (doc: DocWithId) => {
    const rawId = doc.id ?? doc._id;
    return {
      ...doc,
      id: rawId == null ? "" : String(rawId),
    };
  };

  // Meetings
  realtimeBus.on("meeting:created", (m: unknown) => {
    const store = useMeetingsStore.getState();
    const doc = m as DocWithId;
    const n = normalize(doc) as (typeof store.meetings)[number];
    if (!store.meetings.find((x) => x.id === n.id)) {
      store.setMeetings([n, ...store.meetings]);
    }
  });

  realtimeBus.on("meeting:updated", (m: unknown) => {
    const store = useMeetingsStore.getState();
    const doc = m as DocWithId;
    const n = normalize(doc) as (typeof store.meetings)[number];
    store.update(n.id, n);
  });

  realtimeBus.on("meeting:deleted", ({ meetingId }: { meetingId: string }) => {
    useMeetingsStore.getState().remove(meetingId);
  });

  // Tasks
  realtimeBus.on("task:created", (t: unknown) => {
    const doc = t as DocWithId;
    const n = normalize(doc);
    const store = useTasksStore.getState();
    if (!store.tasks.find((x) => x.id === n.id))
      store.setTasks([
        n as unknown as (typeof store.tasks)[number],
        ...store.tasks,
      ]);
  });
  realtimeBus.on("task:updated", (t: unknown) => {
    const doc = t as DocWithId;
    const n = normalize(doc);
    const store = useTasksStore.getState();
    store.update(n.id, n as unknown as (typeof store.tasks)[number]);
  });

  realtimeBus.on("task:completed", ({ taskId }: { taskId: string }) => {
    useTasksStore.getState().update(taskId, { status: "done" as const });
  });

  realtimeBus.on("task:deleted", ({ taskId }: { taskId: string }) => {
    useTasksStore.getState().remove(taskId);
  });
  realtimeBus.on("task:bulk_created", (tasks: unknown) => {
    const store = useTasksStore.getState();
    const arr = Array.isArray(tasks) ? (tasks as DocWithId[]) : [];
    const normalized = arr.map(normalize);
    const existing = new Set(store.tasks.map((t) => t.id));
    const newOnes = normalized.filter((t) => !existing.has(t.id));
    if (newOnes.length)
      store.setTasks([
        ...(newOnes as unknown as typeof store.tasks),
        ...store.tasks,
      ]);
  });

  // Projects
  realtimeBus.on("project:created", (p: unknown) => {
    const doc = p as DocWithId;
    const n = normalize(doc);
    const store = useProjectsStore.getState();
    if (!store.projects.find((x) => x.id === n.id))
      store.setProjects([
        n as unknown as (typeof store.projects)[number],
        ...store.projects,
      ]);
  });
  realtimeBus.on("project:updated", (p: unknown) => {
    const doc = p as DocWithId;
    const n = normalize(doc);
    // Keep project payload update type-safe-ish without relying on implicit any
    const store = useProjectsStore.getState();
    useProjectsStore
      .getState()
      .update(n.id, n as (typeof store.projects)[number]);
  });

  realtimeBus.on("project:deleted", ({ projectId }: { projectId: string }) => {
    const store = useProjectsStore.getState();
    store.setProjects(store.projects.filter((p) => p.id !== projectId));
  });

  // Notifications
  realtimeBus.on("notification:created", (n: unknown) => {
    const doc = n as DocWithId;
    const normalized = normalize(doc);
    const store = useNotificationsStore.getState();
    if (!store.items.find((x) => x.id === normalized.id))
      store.setNotifications([
        normalized as unknown as (typeof store.items)[number],
        ...store.items,
      ]);
  });
  realtimeBus.on(
    "notification:deleted",
    ({ notificationId }: { notificationId: string }) => {
      useNotificationsStore.getState().remove(notificationId);
    },
  );
  realtimeBus.on("notification:all-read", () => {
    useNotificationsStore.getState().markAllRead();
  });
  realtimeBus.on("notification:bulk", (items: unknown) => {
    const store = useNotificationsStore.getState();
    const arr = Array.isArray(items) ? (items as DocWithId[]) : [];
    store.setNotifications([
      ...(arr.map(normalize) as unknown as typeof store.items),
      ...store.items,
    ]);
  });
}
