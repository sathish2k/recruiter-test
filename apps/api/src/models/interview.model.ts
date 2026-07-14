import { type Model, model, models, Schema } from "mongoose";

export interface InterviewDoc {
  agencyId: string;
  candidateId: string;
  candidateName: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  title: string;
  meta: string;
  when: string;
  time: string;
  ts: number;
  status: "upcoming" | "passed";
  note: string;
  inLabel: string;
  badge?: string;
}

const interviewSchema = new Schema<InterviewDoc>(
  {
    agencyId: { type: String, required: true, index: true },
    candidateId: { type: String, default: "", index: true },
    candidateName: { type: String, default: "" },
    initials: { type: String, default: "" },
    avatarBg: { type: String, default: "#4A3A5B" },
    avatarFg: { type: String, default: "#E3CFF5" },
    title: { type: String, default: "" },
    meta: { type: String, default: "" },
    when: { type: String, default: "" },
    time: { type: String, default: "" },
    ts: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["upcoming", "passed"],
      default: "upcoming",
    },
    note: { type: String, default: "" },
    inLabel: { type: String, default: "" },
    badge: { type: String },
  },
  { timestamps: true },
);

export const InterviewModel: Model<InterviewDoc> =
  (models.Interview as Model<InterviewDoc>) ??
  model<InterviewDoc>("Interview", interviewSchema);
