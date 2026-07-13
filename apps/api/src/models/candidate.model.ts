import { type Model, model, models, Schema } from "mongoose";

export interface CandidateDoc {
  agencyId: string;
  name: string;
  email: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  role: string;
  roleCat: string;
  client: string;
  match: number;
  exp: number;
  applied: string;
  appliedTs: number;
  stage: string;
  source: string;
}

const candidateSchema = new Schema<CandidateDoc>(
  {
    agencyId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, default: "" },
    initials: { type: String, default: "" },
    avatarBg: { type: String, default: "#4A3A5B" },
    avatarFg: { type: String, default: "#E3CFF5" },
    role: { type: String, default: "" },
    roleCat: { type: String, default: "" },
    client: { type: String, default: "" },
    match: { type: Number, default: 0 },
    exp: { type: Number, default: 0 },
    applied: { type: String, default: "" },
    appliedTs: { type: Number, default: 0 },
    stage: { type: String, default: "Sourced" },
    source: { type: String, default: "" },
  },
  { timestamps: true },
);

export const CandidateModel: Model<CandidateDoc> =
  (models.Candidate as Model<CandidateDoc>) ??
  model<CandidateDoc>("Candidate", candidateSchema);
