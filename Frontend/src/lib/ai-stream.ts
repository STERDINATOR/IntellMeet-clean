import { API_BASE_URL, tokenManager } from "@/lib/api/client";

type StreamOptions = {
  path: string;
  body: unknown;
  onDelta: (delta: string) => void;
  signal?: AbortSignal;
};

export async function streamAI({ path, body, onDelta, signal }: StreamOptions) {
  const token = tokenManager.getAccessToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok || !response.body) throw new Error("AI stream failed");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";
    for (const event of events) {
      const line = event.split("\n").find((item) => item.startsWith("data: "));
      if (!line) continue;
      const data = line.slice(6);
      if (data === "[DONE]") return;
      const parsed = JSON.parse(data) as { delta?: string };
      if (parsed.delta) onDelta(parsed.delta);
    }
  }
}
