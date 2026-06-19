import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { evaluateAuthz, validateAuthzInput, type Action, type ResourceType } from "./policy.js";

const actorSchema = z.object({
  _id: z.string().min(1),
  workspaceId: z.string().min(1),
  role: z.string().min(1),
  email: z.string().optional(),
  name: z.string().optional(),
});

const requireAuthzSchema = z.object({
  action: z.string().min(1),
  resource: z.object({ type: z.string().min(1), id: z.string().optional() }).optional(),
  context: z.record(z.any()).optional(),
});

type AuthedRequest = Request & { user?: any };

export function requireAuthz(
  action: Action,
  resource:
    | { type: ResourceType; id?: string }
    | ((req: AuthedRequest) => { type: ResourceType; id?: string }),
) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    const rawUser = req.user;
    if (!rawUser) return res.status(401).json({ message: "Unauthenticated" });

    const actor = actorSchema.parse({
      _id: String(rawUser._id ?? rawUser.userId ?? ""),
      workspaceId: String(rawUser.workspaceId),
      role: String(rawUser.role),
      email: rawUser.email,
      name: rawUser.name,
    });

    const resourceResolved =
      typeof resource === "function" ? resource(req) : resource;

    const input = validateAuthzInput({
      actor: {
        userId: actor._id,
        workspaceId: actor.workspaceId,
        role: actor.role,
        email: actor.email,
        name: actor.name,
      },
      action,
      resource: resourceResolved,
      context: {},
    });

    const result = evaluateAuthz(input as any);
    if (!result.allowed)
      return res
        .status(403)
        .json({ message: "Forbidden", reason: result.reason });

    return next();
  };
}


