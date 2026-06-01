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

export const socketEvents = {
  presenceChanged: "presence:changed",
  meetingUpdated: "meeting:updated",
  chatMessage: "chat:message",
  taskUpdated: "task:updated",
  notificationCreated: "notification:created",
  analyticsUpdated: "analytics:updated",
};

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:4000";
let socket: Socket | null = null;
let currentToken: string | null = null;

const hasBrowser = () => typeof window !== "undefined" && typeof navigator !== "undefined";

export const useSocketStore = create<{
  status: RealtimeStatus;
  onlineUserIds: string[];
  lastEventAt: string | null;
  setStatus: (status: RealtimeStatus) => void;
  setOnlineUserIds: (ids: string[]) => void;
  touch: () => void;
}>((set) => ({
  status: hasBrowser() && navigator.onLine ? "online" : "offline",
  onlineUserIds: ["me", "u1", "u2", "u5", "u10"],
  lastEventAt: null,
  setStatus: (status) => set({ status }),
  setOnlineUserIds: (onlineUserIds) => set({ onlineUserIds }),
  touch: () => set({ lastEventAt: new Date().toISOString() }),
}));

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
  } else {
    if (socket && currentToken === token) {
      if (!socket.connected) {
        socket.connect();
      }
      store.setStatus(socket.connected ? "online" : navigator.onLine ? "reconnecting" : "offline");
      return () => {
        window.removeEventListener("online", online);
        window.removeEventListener("offline", offline);
      };
    }

    if (socket) {
      socket.disconnect();
      socket = null;
    }

    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      autoConnect: true,
    });
    currentToken = token;
    socket.on("connect", () => store.setStatus("online"));
    socket.on("disconnect", () => store.setStatus(navigator.onLine ? "reconnecting" : "offline"));
    socket.on("connect_error", () => store.setStatus("offline"));
    Object.values(socketEvents).forEach((event) => {
      socket?.on(event, (payload) => realtimeBus.emit(event, payload));
    });
    ["meeting:participant-joined", "meeting:participant-left", "meeting:reaction", "meeting:control", "webrtc:offer", "webrtc:answer", "webrtc:ice-candidate"].forEach((event) => {
      socket?.on(event, (payload) => realtimeBus.emit(event, payload));
    });
  }
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
    useSocketStore.getState().setStatus("offline");
  },
};

export function useSocketEvent<T>(event: string, handler: EventHandler<T>) {
  return realtimeBus.on(event, (payload: T) => {
    useSocketStore.getState().touch();
    handler(payload);
  });
}
