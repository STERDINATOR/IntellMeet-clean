import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app_room/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/app_room/$id"!</div>;
}
