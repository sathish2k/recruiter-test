import { type Model, model, models, Schema } from "mongoose";

export type NotificationKind = "client" | "ai" | "team" | "system";

export type NotificationDayGroup = "TODAY" | "YESTERDAY" | "EARLIER";

export interface NotificationDoc {
  agencyId: string;
  key: string;
  kind: NotificationKind;
  icon: string;
  text: string;
  timeLabel: string;
  dayGroup: NotificationDayGroup;
  ts: number;
  read: boolean;
  routeId: string;
}

const notificationSchema = new Schema<NotificationDoc>(
  {
    agencyId: { type: String, required: true, index: true },
    key: { type: String, default: "" },
    kind: {
      type: String,
      enum: ["client", "ai", "team", "system"],
      default: "system",
    },
    icon: { type: String, default: "notifications" },
    text: { type: String, default: "" },
    timeLabel: { type: String, default: "" },
    dayGroup: {
      type: String,
      enum: ["TODAY", "YESTERDAY", "EARLIER"],
      default: "EARLIER",
    },
    ts: { type: Number, default: 0 },
    read: { type: Boolean, default: false },
    routeId: { type: String, default: "" },
  },
  { timestamps: true },
);

export const NotificationModel: Model<NotificationDoc> =
  (models.Notification as Model<NotificationDoc>) ??
  model<NotificationDoc>("Notification", notificationSchema);
