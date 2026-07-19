import { type Model, model, models, Schema } from "mongoose";

export type PlacementStatus = "Sent" | "Accepted" | "Negotiating" | "Declined";

export type InvoiceStatus = "none" | "invoiced" | "paid";

export interface PlacementDoc {
  agencyId: string;
  candidateName: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  role: string;
  client: string;
  ctc: number;
  feePct: number;
  status: PlacementStatus;
  invoiceStatus: InvoiceStatus;
  joinDate: string;
  ts: number;
  fee: number;
  sourcer: string;
  lead: string;
  commissionPaid: boolean;
  placedWhen: string;
  placedMonth: number;
}

const placementSchema = new Schema<PlacementDoc>(
  {
    agencyId: { type: String, required: true, index: true },
    candidateName: { type: String, default: "" },
    initials: { type: String, default: "" },
    avatarBg: { type: String, default: "#4A3A5B" },
    avatarFg: { type: String, default: "#E3CFF5" },
    role: { type: String, default: "" },
    client: { type: String, default: "" },
    ctc: { type: Number, default: 0 },
    feePct: { type: Number, default: 20 },
    status: {
      type: String,
      enum: ["Sent", "Accepted", "Negotiating", "Declined"],
      default: "Sent",
    },
    invoiceStatus: {
      type: String,
      enum: ["none", "invoiced", "paid"],
      default: "none",
    },
    joinDate: { type: String, default: "" },
    ts: { type: Number, default: 0 },
    fee: { type: Number, default: 0 },
    sourcer: { type: String, default: "" },
    lead: { type: String, default: "" },
    commissionPaid: { type: Boolean, default: false },
    placedWhen: { type: String, default: "" },
    placedMonth: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const PlacementModel: Model<PlacementDoc> =
  (models.Placement as Model<PlacementDoc>) ??
  model<PlacementDoc>("Placement", placementSchema);
