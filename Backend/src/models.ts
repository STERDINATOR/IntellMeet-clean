import { Schema, model, Types } from "mongoose";

const objectId = Schema.Types.ObjectId;

const workspaceSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  plan: { type: String, default: "pro" },
}, { timestamps: true });

const userSchema = new Schema({
  workspaceId: { type: objectId, ref: "Workspace", required: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  passwordHash: { type: String, required: true },
  avatar: String,
  role: { type: String, enum: ["admin", "manager", "member"], default: "member" },
  department: String,
  online: { type: Boolean, default: false },
  refreshTokenHash: String,
  resetTokenHash: String,
  resetTokenExpires: Date,
  provider: { type: String, enum: ["google", "microsoft"] },
  providerId: { type: String, index: true },
}, { timestamps: true });

const meetingSchema = new Schema({
  workspaceId: { type: objectId, ref: "Workspace", required: true, index: true },
  title: { type: String, required: true },
  start: { type: Date, required: true },
  duration: { type: Number, default: 30 },
  status: { type: String, enum: ["upcoming", "live", "ended"], default: "upcoming", index: true },
  host: { type: objectId, ref: "User", required: true },
  participants: [{ type: objectId, ref: "User" }],
  type: { type: String, enum: ["Team", "Client", "1:1", "All-hands"], default: "Team" },
  agenda: String,
  notes: String,
  score: Number,
  roomId: { type: String, required: true, unique: true },
  recordingUrl: String,
}, { timestamps: true });

const transcriptSchema = new Schema({
  workspaceId: { type: objectId, ref: "Workspace", required: true, index: true },
  meetingId: { type: objectId, ref: "Meeting", required: true, index: true },
  speaker: String,
  text: { type: String, required: true },
  atSeconds: { type: Number, default: 0 },
}, { timestamps: true });

const messageSchema = new Schema({
  workspaceId: { type: objectId, ref: "Workspace", required: true, index: true },
  roomId: { type: String, required: true, index: true },
  userId: { type: objectId, ref: "User", required: true },
  text: { type: String, required: true },
  readBy: [{ type: objectId, ref: "User" }],
}, { timestamps: true });

const projectSchema = new Schema({
  workspaceId: { type: objectId, ref: "Workspace", required: true, index: true },
  name: { type: String, required: true },
  description: String,
  progress: { type: Number, default: 0 },
  members: [{ type: objectId, ref: "User" }],
  color: String,
  due: Date,
}, { timestamps: true });

const taskSchema = new Schema({
  workspaceId: { type: objectId, ref: "Workspace", required: true, index: true },
  title: { type: String, required: true },
  description: String,
  status: { type: String, enum: ["todo", "in_progress", "review", "done"], default: "todo", index: true },
  priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
  assignee: { type: objectId, ref: "User" },
  due: Date,
  project: { type: objectId, ref: "Project" },
  aiScore: { type: Number, default: 50 },
  tags: [String],
  comments: [{ userId: objectId, text: String, at: { type: Date, default: Date.now } }],
}, { timestamps: true });

const notificationSchema = new Schema({
  workspaceId: { type: objectId, ref: "Workspace", required: true, index: true },
  userId: { type: objectId, ref: "User", required: true, index: true },
  type: { type: String, enum: ["meeting", "task", "mention", "ai", "workspace"], required: true },
  title: { type: String, required: true },
  body: String,
  read: { type: Boolean, default: false, index: true },
}, { timestamps: true });

const aiSummarySchema = new Schema({
  workspaceId: { type: objectId, ref: "Workspace", required: true, index: true },
  meetingId: { type: objectId, ref: "Meeting", index: true },
  prompt: String,
  summary: String,
  decisions: [String],
  actionItems: [{ title: String, assignee: String, due: Date, priority: String }],
  model: String,
}, { timestamps: true });

const reportSchema = new Schema({
  workspaceId: { type: objectId, ref: "Workspace", required: true, index: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  payload: Schema.Types.Mixed,
}, { timestamps: true });

export type AuthUser = {
  _id: Types.ObjectId;
  workspaceId: Types.ObjectId;
  email: string;
  role: "admin" | "manager" | "member";
  name: string;
};

export const Workspace = model("Workspace", workspaceSchema);
export const User = model("User", userSchema);
export const Meeting = model("Meeting", meetingSchema);
export const Transcript = model("Transcript", transcriptSchema);
export const Message = model("Message", messageSchema);
export const Project = model("Project", projectSchema);
export const Task = model("Task", taskSchema);
export const Notification = model("Notification", notificationSchema);
export const AISummary = model("AISummary", aiSummarySchema);
export const Report = model("Report", reportSchema);
