import { z } from "zod";
import { AuditLog } from "../../models.js";

export const auditEventSchema = z.object({
  eventType: z
    .enum([
      "AUTH_LOGIN",
      "AUTH_LOGOUT",
      "MEETING_CREATE",
      "MEETING_UPDATE",
      "MEETING_DELETE",
      "MEETING_LAUNCH",
      "TRANSCRIPT_CREATE",
      "CHAT_SEND",
      "TASK_CREATE",
      "TASK_UPDATE",
      "TASK_DELETE",
      "PROJECT_CREATE",
      "PROJECT_UPDATE",
      "PROJECT_DELETE",
      "NOTIFICATION_CREATE",
      "AI_ASK",
      "AI_SUMMARY_CREATE",
      "EXPORT",
      "SHARE",
      "REALTIME_MEETING_JOIN",
      "REALTIME_MEETING_LEAVE",
      "REALTIME_TASK_UPDATED",
      "REALTIME_NOTIFICATION_CREATED",
      "SYSTEM",
    ])
    .describe("High-level domain event name"),

  severity: z.enum(["info", "warn", "error"]).default("info"),

  actor: z
    .object({
      userId: z.string().min(1),
      workspaceId: z.string().min(1),
      role: z.string().optional(),
      email: z.string().optional(),
      name: z.string().optional(),
    })
    .optional(),

  resource: z
    .object({
      type: z.string().min(1),
      id: z.string().optional(),
    })
    .optional(),

  metadata: z.record(z.any()).optional(),
});

export type AuditEvent = z.infer<typeof auditEventSchema>;

export async function writeAuditLog(event: AuditEvent) {
  const parsed = auditEventSchema.parse(event);

  // Persisting is best-effort so audit never breaks core workflows.
  try {
    await AuditLog.create({
      workspaceId: parsed.actor?.workspaceId ?? "",
      actorUserId: parsed.actor?.userId ?? undefined,
      eventType: parsed.eventType,
      severity: parsed.severity,
      resourceType: parsed.resource?.type,
      resourceId: parsed.resource?.id,
      metadata: parsed.metadata ?? {},
    });
  } catch {
    // swallow
  }
}

