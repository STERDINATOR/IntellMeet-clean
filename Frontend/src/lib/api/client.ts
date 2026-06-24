import { useAuthStore } from "@/lib/stores";

type ApiOptions = RequestInit & { retry?: number };

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public payload?: unknown,
  ) {
    super(message);
  }
}

export const tokenManager = {
  getAccessToken: () => useAuthStore.getState().accessToken,
  getRefreshToken: () => useAuthStore.getState().refreshToken,
  clear: () => useAuthStore.getState().logout(),
};

async function refreshTokens(): Promise<boolean> {
  const refreshToken = tokenManager.getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return false;
    const payload = (await response.json()) as {
      accessToken?: string;
      refreshToken?: string;
      user?: unknown;
    };
    if (!payload.accessToken) return false;

    useAuthStore.getState().setSession({
      user: payload.user ?? useAuthStore.getState().user,
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken ?? refreshToken,
    });
    return true;
  } catch {
    return false;
  }
}

async function request<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const retry = options.retry ?? 1;
  const headers = new Headers(options.headers);
  headers.set(
    "Content-Type",
    headers.get("Content-Type") ?? "application/json",
  );
  const token = tokenManager.getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (res.ok) return res.status === 204 ? (undefined as T) : await res.json();

  if (res.status === 401 && retry > 0 && tokenManager.getRefreshToken()) {
    const refreshed = await refreshTokens();
    if (refreshed) return request<T>(path, { ...options, retry: retry - 1 });
    tokenManager.clear();
  }

  let payload: unknown;
  try {
    payload = await res.json();
  } catch (e) {
    // Ignore JSON parse failures; response may be empty/non-JSON.
    payload = undefined;
  }
  throw new ApiError(`Request failed: ${res.status}`, res.status, payload);
}

export const apiClient = {
  get: <T>(path: string, options?: ApiOptions) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: ApiOptions) =>
    request<T>(path, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown, options?: ApiOptions) =>
    request<T>(path, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string, options?: ApiOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
