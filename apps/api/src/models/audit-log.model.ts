import { type Model, model, models, Schema } from "mongoose";

export type AuditKind =
  | "permissions"
  | "candidates"
  | "client"
  | "jobs"
  | "billing"
  | "system";

export interface AuditLogDoc {
  agencyId: string;
  actor: string;
  actorInitials: string;
  actorColorKey: string;
  kind: AuditKind;
  text: string;
  ip: string;
  ts: number;
  whenLabel: string;
}

const auditLogSchema = new Schema<AuditLogDoc>(
  {
    agencyId: { type: String, required: true },
    actor: { type: String, default: "" },
    actorInitials: { type: String, default: "" },
    actorColorKey: { type: String, default: "slate" },
    kind: {
      type: String,
      enum: [
        "permissions",
        "candidates",
        "client",
        "jobs",
        "billing",
        "system",
      ],
      default: "system",
    },
    text: { type: String, default: "" },
    ip: { type: String, default: "" },
    ts: { type: Number, default: 0 },
    whenLabel: { type: String, default: "" },
  },
  { timestamps: true },
);

auditLogSchema.index({ agencyId: 1, ts: -1 });

export const AuditLogModel: Model<AuditLogDoc> =
  (models.AuditLog as Model<AuditLogDoc>) ??
  model<AuditLogDoc>("AuditLog", auditLogSchema);
