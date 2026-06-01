import type { Meeting } from "./mock";

export const buildMeetingLink = (id: string) => `${window.location.origin}/app/room/${id}`;

export async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const el = document.createElement("textarea");
  el.value = value;
  el.style.position = "fixed";
  el.style.opacity = "0";
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
}

export function downloadText(filename: string, content: string, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function meetingExport(meeting: Meeting) {
  return [
    `# ${meeting.title}`,
    "",
    `Start: ${new Date(meeting.start).toLocaleString()}`,
    `Duration: ${meeting.duration} minutes`,
    `Type: ${meeting.type}`,
    `Status: ${meeting.status}`,
    `Participants: ${meeting.participants.length}`,
    "",
    "## AI Summary",
    "The team aligned on priorities, owners, risks, and next steps. Action items were extracted and are ready to convert into tasks.",
    "",
    "## Action Items",
    "- Ship WebRTC SFU migration plan",
    "- Finalize Aurora v2 audit",
    "- Draft AI eval dashboard",
    "- Confirm launch timeline",
  ].join("\n");
}

export function csv(rows: Record<string, string | number>[]) {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const esc = (v: string | number) => `"${String(v).replaceAll('"', '""')}"`;
  return [keys.join(","), ...rows.map((row) => keys.map((key) => esc(row[key])).join(","))].join("\n");
}
