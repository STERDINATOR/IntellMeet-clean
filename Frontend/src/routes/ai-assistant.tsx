import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/ai-assistant")({
  beforeLoad: () => { throw redirect({ to: "/app/ai-assistant" }); },
});
