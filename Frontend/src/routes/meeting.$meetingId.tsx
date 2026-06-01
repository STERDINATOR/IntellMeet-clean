import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/meeting/$meetingId")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/app/meetings/$id", params: { id: params.meetingId } });
  },
});
