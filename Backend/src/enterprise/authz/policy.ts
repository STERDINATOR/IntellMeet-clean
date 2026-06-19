import { z } from "zod";

export type Action =
  | "MEETING_CREATE"
  | "MEETING_UPDATE"
  | "MEETING_DELETE"
  | "MEETING_LAUNCH"
  | "TRANSCRIPT_CREATE"
  | "TRANSCRIPT_READ"
  | "TASK_CREATE"
  | "TASK_UPDATE"
  | "TASK_DELETE"
  | "PROJECT_CREATE"
  | "PROJECT_UPDATE"
  | "PROJECT_DELETE"
  | "NOTIFICATION_CREATE"
  | "NOTIFICATION_DELETE"
  | "NOTIFICATION_MARK_READ"
  | "EXPORT"
  | "AI_SUMMARY_CREATE"
  | "AI_ACTION_ITEMS_CREATE"
  | "AI_INSIGHTS_READ"
  | "AI_KNOWLEDGE_GRAPH_READ"
  | "AI_WORKSPACE_INSIGHTS_GENERATE"
  | "REALTIME_MEETING_JOIN"
  | "CHAT_SEND"
  | "REALTIME_NOTIFICATION_CREATE"
  | "SYSTEM";


export type ResourceType =
  | "Meeting"
  | "Transcript"
  | "Task"
  | "Project"
  | "Notification"
  | "AISummary"
  | "Report";

export type Actor = {
  userId: string;
  workspaceId: string;
  role: "admin" | "manager" | "member" | string;
  email?: string;
  name?: string;
};

export type AuthzInput = {
  actor: Actor;
  action: Action;
  resource: { type: ResourceType; id?: string };
  context?: Record<string, unknown>;
};

// Production-grade RBAC/ABAC requires policy persistence + rule evaluation.
// This file defines the policy contract and an initial rule set
// driven by existing role field (coarse RBAC) so authorization
// logic is centralized and testable.

const actorSchema = z.object({
  userId: z.string().min(1),
  workspaceId: z.string().min(1),
  role: z.string().min(1),
  email: z.string().optional(),
  name: z.string().optional(),
});

const authzSchema = z.object({
  actor: actorSchema,
  action: z.string().min(1),
  resource: z.object({
    type: z.string().min(1),
    id: z.string().optional(),
  }),
  context: z.record(z.any()).optional(),
});

export function validateAuthzInput(input: unknown) {
  return authzSchema.parse(input);
}

export function evaluateAuthz(input: AuthzInput): { allowed: boolean; reason?: string } {
  // Coarse RBAC baseline using current persistence model (User.role).
  // ABAC will require additional resource attributes + policy rules.
  const role = input.actor.role;

  const allowForAdmin = new Set<Action>([
    "MEETING_CREATE",
    "MEETING_UPDATE",
    "MEETING_DELETE",
    "MEETING_LAUNCH",
    "TRANSCRIPT_CREATE",
    "TASK_CREATE",
    "TASK_UPDATE",
    "TASK_DELETE",
    "PROJECT_CREATE",
    "PROJECT_UPDATE",
    "PROJECT_DELETE",
    "NOTIFICATION_CREATE",
    "NOTIFICATION_DELETE",
    "NOTIFICATION_MARK_READ",
    "EXPORT",
    "AI_SUMMARY_CREATE",
    "AI_ACTION_ITEMS_CREATE",
    "REALTIME_MEETING_JOIN",
    "CHAT_SEND",
    "REALTIME_NOTIFICATION_CREATE",
    "SYSTEM",
  ]);

  if (role === "admin") return { allowed: true };

  if (role === "manager") {
    if (
      input.action === "MEETING_CREATE" ||
      input.action === "MEETING_UPDATE" ||
      input.action === "MEETING_DELETE" ||
      input.action === "MEETING_LAUNCH" ||
      input.action === "TRANSCRIPT_CREATE" ||
      input.action === "TRANSCRIPT_READ" ||
      input.action === "TASK_CREATE" ||
      input.action === "TASK_UPDATE" ||
      input.action === "TASK_DELETE" ||
      input.action === "PROJECT_CREATE" ||
      input.action === "PROJECT_UPDATE" ||
      input.action === "NOTIFICATION_CREATE" ||
      input.action === "NOTIFICATION_DELETE" ||
      input.action === "NOTIFICATION_MARK_READ" ||
      input.action === "EXPORT" ||
      input.action === "AI_SUMMARY_CREATE" ||
      input.action === "AI_ACTION_ITEMS_CREATE" ||
      input.action === "AI_INSIGHTS_READ" ||
      input.action === "AI_KNOWLEDGE_GRAPH_READ" ||
      input.action === "AI_WORKSPACE_INSIGHTS_GENERATE" ||
      input.action === "REALTIME_MEETING_JOIN" ||
      input.action === "CHAT_SEND" ||
      input.action === "REALTIME_NOTIFICATION_CREATE"
    ) {
      return { allowed: true };
    }

    return { allowed: false, reason: "Role does not permit this action" };
  }


  // member: allow read-only meeting/task analytics, but allow meeting participation + chat + create tasks via AI if policy permits.
  if (role === "member") {
    if (
      input.action === "REALTIME_MEETING_JOIN" ||
      input.action === "CHAT_SEND" ||
      input.action === "TASK_UPDATE" ||
      input.action === "REALTIME_NOTIFICATION_CREATE" ||
      input.action === "AI_ACTION_ITEMS_CREATE" ||
      input.action === "AI_SUMMARY_CREATE" ||
      input.action === "NOTIFICATION_MARK_READ"
    ) {
      return { allowed: true };
    }
    return { allowed: false, reason: "Role does not permit this action" };
  }

  return { allowed: false, reason: "Unknown role" };
}

