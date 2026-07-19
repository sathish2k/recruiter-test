import { isValidObjectId } from "mongoose";
import {
  type NotificationDoc,
  NotificationModel,
} from "../models/notification.model";

export interface NotificationSeed {
  key: string;
  kind: NotificationDoc["kind"];
  icon: string;
  text: string;
  timeLabel: string;
  dayGroup: NotificationDoc["dayGroup"];
  read: boolean;
  routeId: string;
  offsetMin: number;
}

// ponytail: timeLabels ("Yesterday 4:30 PM", "Mon 9:15 AM") are a seeded
// illustration — there is no real event stream yet, so `ts` is derived from
// `offsetMin` at seed time only to keep the feed ordered newest-first.
export const DEFAULT_NOTIFICATIONS: NotificationSeed[] = [
  {
    key: "clientApproved",
    kind: "client",
    icon: "check-circle",
    text: "Nortech approved Savannah Nguyen for the onsite round",
    timeLabel: "12m ago",
    dayGroup: "TODAY",
    read: false,
    routeId: "Recruit.Pipeline.Route",
    offsetMin: 12,
  },
  {
    key: "cvForwarded",
    kind: "ai",
    icon: "move-up",
    text: "3 strong CVs forwarded to Ana Novak for review",
    timeLabel: "48m ago",
    dayGroup: "TODAY",
    read: false,
    routeId: "Recruit.AiScreening.Route",
    offsetMin: 48,
  },
  {
    key: "aiScored",
    kind: "ai",
    icon: "sparkle",
    text: "AI scored 14 new CVs for Senior Backend Engineer",
    timeLabel: "1h ago",
    dayGroup: "TODAY",
    read: false,
    routeId: "Recruit.AiScreening.Route",
    offsetMin: 70,
  },
  {
    key: "interviewSoon",
    kind: "system",
    icon: "event",
    text: "Interview with Priya Raman starts in 45 minutes",
    timeLabel: "2h ago",
    dayGroup: "TODAY",
    read: false,
    routeId: "Recruit.Interviews.Route",
    offsetMin: 120,
  },
  {
    key: "slaAlert",
    kind: "system",
    icon: "hourglass",
    text: "5 candidates awaiting a client decision past SLA",
    timeLabel: "3h ago",
    dayGroup: "TODAY",
    read: false,
    routeId: "Recruit.Pipeline.Route",
    offsetMin: 180,
  },
  {
    key: "offerAccepted",
    kind: "client",
    icon: "handshake",
    text: "Alexis Kim accepted the offer at Vantor",
    timeLabel: "Yesterday 4:30 PM",
    dayGroup: "YESTERDAY",
    read: false,
    routeId: "Recruit.Placements.Route",
    offsetMin: 1050,
  },
  {
    key: "targetHit",
    kind: "team",
    icon: "flag",
    text: "Dev Shah hit the weekly invite target (50/50)",
    timeLabel: "Yesterday 2:10 PM",
    dayGroup: "YESTERDAY",
    read: true,
    routeId: "Recruit.TeamActivity.Route",
    offsetMin: 1200,
  },
  {
    key: "jdReply",
    kind: "team",
    icon: "mail-filled",
    text: "Fablio replied on the Frontend Engineer JD thread",
    timeLabel: "Yesterday 11:02 AM",
    dayGroup: "YESTERDAY",
    read: true,
    routeId: "Recruit.Clients.Route",
    offsetMin: 1380,
  },
  {
    key: "invoiceOverdue",
    kind: "system",
    icon: "payments",
    text: "Invoice for Leo Martins' placement is overdue",
    timeLabel: "Mon 9:15 AM",
    dayGroup: "EARLIER",
    read: true,
    routeId: "Recruit.Placements.Route",
    offsetMin: 3000,
  },
  {
    key: "scorecardPending",
    kind: "team",
    icon: "fact_check",
    text: "Tom Weaver's scorecard for Tomas Vieira is pending",
    timeLabel: "Mon 8:40 AM",
    dayGroup: "EARLIER",
    read: true,
    routeId: "Recruit.Interviews.Route",
    offsetMin: 3100,
  },
];

/** Creates the default notification feed for an agency. Idempotent — existing
 * notifications are left untouched (only missing keys are inserted). */
export async function seedAgencyNotifications(agencyId: string): Promise<void> {
  const now = Date.now();
  await Promise.all(
    DEFAULT_NOTIFICATIONS.map((item) => {
      const { offsetMin, ...rest } = item;
      return NotificationModel.updateOne(
        { agencyId, key: item.key },
        { $setOnInsert: { agencyId, ...rest, ts: now - offsetMin * 60_000 } },
        { upsert: true },
      );
    }),
  );
}

export interface NotificationView {
  id: string;
  kind: NotificationDoc["kind"];
  icon: string;
  text: string;
  timeLabel: string;
  dayGroup: NotificationDoc["dayGroup"];
  read: boolean;
  routeId: string;
}

export interface NotificationListResult {
  data: NotificationView[];
  meta: { totalCount: number; unreadCount: number };
}

function mapNotification(
  doc: NotificationDoc & { _id: unknown },
): NotificationView {
  return {
    id: String(doc._id),
    kind: doc.kind,
    icon: doc.icon,
    text: doc.text,
    timeLabel: doc.timeLabel,
    dayGroup: doc.dayGroup,
    read: doc.read,
    routeId: doc.routeId,
  };
}

export async function listNotifications(
  agencyId: string,
): Promise<NotificationListResult> {
  let docs = await NotificationModel.find({ agencyId }).sort({ ts: -1 }).lean();
  if (docs.length === 0) {
    await seedAgencyNotifications(agencyId);
    docs = await NotificationModel.find({ agencyId }).sort({ ts: -1 }).lean();
  }
  const data = docs.map((d) =>
    mapNotification(d as NotificationDoc & { _id: unknown }),
  );
  const unreadCount = data.filter((n) => !n.read).length;
  return { data, meta: { totalCount: data.length, unreadCount } };
}

export async function markAllRead(
  agencyId: string,
): Promise<{ unreadCount: number }> {
  await NotificationModel.updateMany(
    { agencyId, read: false },
    { $set: { read: true } },
  );
  return { unreadCount: 0 };
}

export async function markRead(
  agencyId: string,
  id: string,
): Promise<{ data: NotificationView } | { error: "not-found" }> {
  if (!isValidObjectId(id)) return { error: "not-found" };
  const doc = await NotificationModel.findOneAndUpdate(
    { _id: id, agencyId },
    { $set: { read: true } },
    { new: true },
  ).lean();
  if (!doc) return { error: "not-found" };
  return { data: mapNotification(doc as NotificationDoc & { _id: unknown }) };
}
