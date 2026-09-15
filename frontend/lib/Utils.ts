import { HistoryEntry } from "@/components/tickets/detailed/HistoryTimeLine";

export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  const intervals: [string, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];

  for (const [label, secondsInUnit] of intervals) {
    const count = Math.floor(seconds / secondsInUnit);
    if (count >= 1) return `${count} ${label}${count > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

// Map raw backend "field" names to the labels/colors shown in the UI.
// Extend this as you add more editable fields on the ticket.
const FIELD_LABELS: Record<string, string> = {
  status: "Status changed",
  assigned_to: "Assigned to",
  priority: "Priority changed",
  subject: "Subject changed",
  description: "Description updated",
};

const FIELD_COLORS: Record<string, string> = {
  status: "#2dd4bf", // teal
  assigned_to: "#60a5fa", // blue
  priority: "#fb7185", // red/pink
};

const DEFAULT_COLOR = "#60a5fa";

export interface HistoryDisplay {
  title: string;
  subtitle: string | null;
  color: string;
}

export function getHistoryDisplay(entry: HistoryEntry): HistoryDisplay {
  // create_ticket() writes action="Ticket created", field="Ticket created",
  // with no old/new value — render it as a plain creation event.
  if (entry.action === "Ticket created" || entry.field === "Ticket created") {
    return { title: "Ticket created", subtitle: null, color: DEFAULT_COLOR };
  }

  const title = FIELD_LABELS[entry.field] ?? entry.field;
  const color = FIELD_COLORS[entry.field] ?? DEFAULT_COLOR;
  const oldVal = entry.old_value ?? "—";
  const newVal = entry.new_value ?? "—";

  return { title, subtitle: `${oldVal} → ${newVal}`, color };
}