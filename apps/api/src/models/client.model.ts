import { type Model, model, models, Schema } from "mongoose";

export interface ClientDoc {
  agencyId: string;
  name: string;
  industry: string;
  manager: string;
  status: "hiring" | "paused";
  openRoles: number;
  hires: number;
  sourced: number;
  screened: number;
  interviewing: number;
  activity: string;
}

const clientSchema = new Schema<ClientDoc>(
  {
    agencyId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    industry: { type: String, default: "" },
    manager: { type: String, default: "" },
    status: { type: String, enum: ["hiring", "paused"], default: "hiring" },
    openRoles: { type: Number, default: 0 },
    hires: { type: Number, default: 0 },
    sourced: { type: Number, default: 0 },
    screened: { type: Number, default: 0 },
    interviewing: { type: Number, default: 0 },
    activity: { type: String, default: "" },
  },
  { timestamps: true },
);

export const ClientModel: Model<ClientDoc> =
  (models.Client as Model<ClientDoc>) ??
  model<ClientDoc>("Client", clientSchema);
