import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "./config/env.js";
import type { AuthUser } from "./models.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function signAccessToken(user: AuthUser) {
  return jwt.sign({
    sub: String(user._id),
    workspaceId: String(user.workspaceId),
    email: user.email,
    role: user.role,
    name: user.name,
  }, env.jwtAccessSecret, { expiresIn: "15m" });
}

export function signRefreshToken(user: AuthUser) {
  return jwt.sign({ sub: String(user._id), workspaceId: String(user.workspaceId) }, env.jwtRefreshSecret, { expiresIn: "30d" });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ message: "Missing bearer token" });
  try {
    const payload = jwt.verify(token, env.jwtAccessSecret) as jwt.JwtPayload;
    req.user = {
      _id: payload.sub,
      workspaceId: payload.workspaceId,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    } as unknown as AuthUser;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireRole(...roles: AuthUser["role"][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: "Unauthenticated" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
    return next();
  };
}
