import crypto from "crypto";
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Issuer, generators } from "openid-client";
import { z } from "zod";
import { signAccessToken, signRefreshToken, requireAuth } from "../auth.js";
import { env } from "../config/env.js";
import { User, Workspace } from "../models.js";
import { createAuditLog } from "../realtime.js";

export const authRouter = Router();

const oauthStateCookieName = "oauth_state";

const oauthProviders = {
  google: {
    issuer: "https://accounts.google.com",
    clientId: env.googleClientId,
    clientSecret: env.googleClientSecret,
    scope: "openid email profile",
    prompt: "consent",
  },
  microsoft: {
    issuer: "https://login.microsoftonline.com/common/v2.0",
    clientId: env.microsoftClientId,
    clientSecret: env.microsoftClientSecret,
    scope: "openid email profile offline_access User.Read",
    prompt: "select_account",
  },
} as const;

function getOauthRedirectUri(provider: keyof typeof oauthProviders) {
  return `${env.backendUrl}/api/auth/oauth/callback/${provider}`;
}

async function getOauthClient(provider: keyof typeof oauthProviders) {
  const config = oauthProviders[provider];
  if (!config.clientId || !config.clientSecret) {
    throw new Error(`Missing OAuth secret for provider: ${provider}`);
  }

  const issuer = await Issuer.discover(config.issuer);
  return new issuer.Client({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uris: [getOauthRedirectUri(provider)],
    response_types: ["code"],
  });
}

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  workspaceName: z.string().min(2).default("IntellMeet HQ"),
});

authRouter.post("/signup", async (req, res) => {
  const data = signupSchema.parse(req.body);
  const existing = await User.findOne({ email: data.email.toLowerCase() });
  if (existing) return res.status(409).json({ message: "Email already exists" });

  const workspace = await Workspace.create({
    name: data.workspaceName,
    slug: data.workspaceName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  });
  const user = await User.create({
    workspaceId: workspace._id,
    name: data.name,
    email: data.email,
    passwordHash: await bcrypt.hash(data.password, 12),
    role: "admin",
    department: "Executive",
    online: true,
  });
  const accessToken = signAccessToken(user as never);
  const refreshToken = signRefreshToken(user as never);
  user.refreshTokenHash = await bcrypt.hash(refreshToken, 12);
  await user.save();
  await createAuditLog({ workspaceId: String(workspace._id), actorUserId: String(user._id), eventType: "auth.signup", resourceType: "user", resourceId: String(user._id), after: { email: user.email, name: user.name }, ip: String(req.headers["x-forwarded-for"] ?? req.socket.remoteAddress ?? ""), device: String(req.headers["user-agent"] ?? "") });
  return res.status(201).json({ user, accessToken, refreshToken });
});

authRouter.post("/login", async (req, res) => {
  const data = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(req.body);
  const user = await User.findOne({ email: data.email.toLowerCase() });
  if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
    await createAuditLog({ eventType: "auth.login_failed", severity: "warn", resourceType: "user", resourceId: data.email, ip: String(req.headers["x-forwarded-for"] ?? req.socket.remoteAddress ?? ""), device: String(req.headers["user-agent"] ?? "") });
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const accessToken = signAccessToken(user as never);
  const refreshToken = signRefreshToken(user as never);
  user.refreshTokenHash = await bcrypt.hash(refreshToken, 12);
  user.online = true;
  await user.save();
  await createAuditLog({ workspaceId: String(user.workspaceId), actorUserId: String(user._id), eventType: "auth.login", resourceType: "user", resourceId: String(user._id), ip: String(req.headers["x-forwarded-for"] ?? req.socket.remoteAddress ?? ""), device: String(req.headers["user-agent"] ?? "") });
  return res.json({ user, accessToken, refreshToken });
});

authRouter.get("/oauth/:provider", async (req, res) => {
  const provider = req.params.provider as keyof typeof oauthProviders;
  if (!Object.keys(oauthProviders).includes(provider)) {
    return res.status(400).json({ message: "Unsupported OAuth provider" });
  }

  try {
    const client = await getOauthClient(provider);
    const state = generators.random(48);
    const authUrl = client.authorizationUrl({
      scope: oauthProviders[provider].scope,
      state,
      prompt: oauthProviders[provider].prompt,
    });

    res.cookie(oauthStateCookieName, state, {
      httpOnly: true,
      sameSite: "lax",
      secure: env.backendUrl.startsWith("https://"),
      maxAge: 1000 * 60 * 10,
    });

    return res.redirect(authUrl);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to start OAuth flow" });
  }
});

authRouter.get("/oauth/callback/:provider", async (req, res) => {
  const provider = req.params.provider as keyof typeof oauthProviders;
  if (!Object.keys(oauthProviders).includes(provider)) {
    return res.status(400).json({ message: "Unsupported OAuth provider" });
  }

  const state = req.cookies?.[oauthStateCookieName];
  const code = req.query.code as string | undefined;
  const error = req.query.error as string | undefined;

  if (error) {
    const redirectUrl = new URL(`${env.clientUrl}/login`);
    redirectUrl.searchParams.set("oauthError", error);
    return res.redirect(redirectUrl.toString());
  }

  if (!state || !code) {
    return res.status(400).json({ message: "Missing OAuth state or code" });
  }

  try {
    const client = await getOauthClient(provider);
    const tokenSet = await client.callback(getOauthRedirectUri(provider), req.query as any, { state });
    const claims = tokenSet.claims();
    const email = String(claims.email || claims.preferred_username || "");
    const name = String(claims.name || `${claims.given_name ?? ""} ${claims.family_name ?? ""}`.trim() || email.split("@")[0]);
    const providerId = String(claims.sub);
    const avatar = String(claims.picture || "");

    if (!email) {
      return res.status(400).json({ message: "OAuth provider did not return an email address" });
    }

    let user = await User.findOne({ $or: [{ provider, providerId }, { email: email.toLowerCase() }] });
    if (!user) {
      const workspace = await Workspace.create({
        name: `${name}'s workspace`,
        slug: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-workspace`,
      });
      user = await User.create({
        workspaceId: workspace._id,
        name,
        email: email.toLowerCase(),
        passwordHash: await bcrypt.hash(crypto.randomBytes(20).toString("hex"), 12),
        role: "admin",
        department: "Executive",
        avatar,
        provider,
        providerId,
        online: true,
      });
    } else {
      user.provider = provider;
      user.providerId = providerId;
      user.avatar = user.avatar || avatar;
      user.online = true;
    }

    const accessToken = signAccessToken(user as never);
    const refreshToken = signRefreshToken(user as never);
    user.refreshTokenHash = await bcrypt.hash(refreshToken, 12);
    await user.save();

    res.clearCookie(oauthStateCookieName, {
      httpOnly: true,
      sameSite: "lax",
      secure: env.backendUrl.startsWith("https://"),
    });

    const redirectUrl = new URL(`${env.clientUrl}/login`);
    redirectUrl.searchParams.set("oauthSuccess", "1");
    redirectUrl.searchParams.set("accessToken", accessToken);
    redirectUrl.searchParams.set("refreshToken", refreshToken);
    return res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error(error);
    const redirectUrl = new URL(`${env.clientUrl}/login`);
    redirectUrl.searchParams.set("oauthError", "OAuth callback failed");
    return res.redirect(redirectUrl.toString());
  }
});

authRouter.post("/refresh", async (req, res) => {
  const data = z.object({ refreshToken: z.string() }).parse(req.body);
  const payload = jwt.verify(data.refreshToken, env.jwtRefreshSecret) as jwt.JwtPayload;
  const user = await User.findById(payload.sub);
  if (!user?.refreshTokenHash || !(await bcrypt.compare(data.refreshToken, user.refreshTokenHash))) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
  return res.json({ accessToken: signAccessToken(user as never) });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user!._id).select("-passwordHash -refreshTokenHash -resetTokenHash -resetTokenExpires");
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({ user });
});

authRouter.post("/logout", requireAuth, async (req, res) => {
  const user = await User.findById(req.user!._id);
  if (user) {
    user.online = false;
    user.refreshTokenHash = undefined;
    await user.save();
  }
  await createAuditLog({ workspaceId: String(req.user!.workspaceId), actorUserId: String(req.user!._id), eventType: "auth.logout", resourceType: "user", resourceId: String(req.user!._id), ip: String(req.headers["x-forwarded-for"] ?? req.socket.remoteAddress ?? ""), device: String(req.headers["user-agent"] ?? "") });
  return res.sendStatus(204);
});

authRouter.post("/forgot-password", async (req, res) => {
  const data = z.object({ email: z.string().email() }).parse(req.body);
  const user = await User.findOne({ email: data.email.toLowerCase() });
  if (user) {
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetTokenHash = await bcrypt.hash(resetToken, 12);
    user.resetTokenExpires = new Date(Date.now() + 1000 * 60 * 60);
    await user.save();
    console.log(`Password reset token for ${user.email}: ${resetToken}`);
  }
  return res.json({ message: "If the account exists, a reset link has been sent." });
});

authRouter.post("/reset-password", async (req, res) => {
  const data = z.object({ email: z.string().email(), token: z.string(), password: z.string().min(8) }).parse(req.body);
  const user = await User.findOne({ email: data.email.toLowerCase() });
  if (!user || !user.resetTokenHash || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
    return res.status(400).json({ message: "Invalid or expired reset token" });
  }
  const validToken = await bcrypt.compare(data.token, user.resetTokenHash);
  if (!validToken) {
    return res.status(400).json({ message: "Invalid reset token" });
  }
  user.passwordHash = await bcrypt.hash(data.password, 12);
  user.refreshTokenHash = undefined;
  user.resetTokenHash = undefined;
  user.resetTokenExpires = undefined;
  await user.save();
  return res.json({ message: "Password reset complete" });
});
