import { type Model, model, models, Schema } from "mongoose";

export interface JobDoc {
  agencyId: string;
  title: string;
  roleCat: string;
  level: string;
  openings: number;
  client: string;
  clientInitial: string;
  logoBg: string;
  logoFg: string;
  location: string;
  empType: string;
  pipeline: number;
  matched: number;
  posted: string;
  postedTs: number;
  status: "Active" | "Draft" | "Closed";
}

const jobSchema = new Schema<JobDoc>(
  {
    agencyId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    roleCat: { type: String, default: "" },
    level: { type: String, default: "" },
    openings: { type: Number, default: 1 },
    client: { type: String, default: "" },
    clientInitial: { type: String, default: "" },
    logoBg: { type: String, default: "#3A4A5B" },
    logoFg: { type: String, default: "#CFE3F5" },
    location: { type: String, default: "" },
    empType: { type: String, default: "" },
    pipeline: { type: Number, default: 0 },
    matched: { type: Number, default: 0 },
    posted: { type: String, default: "—" },
    postedTs: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Active", "Draft", "Closed"],
      default: "Draft",
    },
  },
  { timestamps: true },
);

export const JobModel: Model<JobDoc> =
  (models.Job as Model<JobDoc>) ?? model<JobDoc>("Job", jobSchema);
