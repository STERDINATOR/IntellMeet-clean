import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/meetings")({
  beforeLoad: () => {
    throw redirect({ to: "/app/meetings" });
  },
});
