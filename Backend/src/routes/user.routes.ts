import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../auth.js";
import { User } from "../models.js";

export const userRouter = Router();
userRouter.use(requireAuth);

userRouter.get("/users", async (req, res) => {
  // Workspace-scoped user directory for Team + Task assignee resolution.
  // Keep payload minimal for frontend.
  const users = await User.find({ workspaceId: req.user!.workspaceId })
    .select("name email avatar role department online")
    .sort({ name: 1 });

  res.json(
    users.map((u) => ({
      id: String(u._id),
      name: u.name,
      email: u.email,
      avatar: u.avatar,
      role: u.role,
      department: u.department,
      online: u.online,
    })),
  );
});

userRouter.get("/users/:id", async (req, res) => {
  const params = z.object({ id: z.string().min(1) }).parse(req.params);
  const user = await User.findOne({ _id: params.id, workspaceId: req.user!.workspaceId }).select(
    "name email avatar role department online",
  );

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({
    id: String(user._id),
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    department: user.department,
    online: user.online,
  });
});

