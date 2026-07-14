import { type Model, model, models, Schema } from "mongoose";

export interface JobTeamMember {
  name: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  roleLabel: string;
  badge: string;
  badgeTone: string;
}

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
  description: string;
  salaryMin: string;
  salaryMax: string;
  skills: string[];
  pipeline: number;
  matched: number;
  posted: string;
  postedTs: number;
  status: "Active" | "Draft" | "Closed";
  qualifications: string[];
  responsibilities: string[];
  views: number;
  saves: number;
  recruitEndTs: number;
  team: JobTeamMember[];
  screeningOn: boolean;
  screeningThreshold: number;
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
    description: { type: String, default: "" },
    salaryMin: { type: String, default: "" },
    salaryMax: { type: String, default: "" },
    skills: { type: [String], default: [] },
    pipeline: { type: Number, default: 0 },
    matched: { type: Number, default: 0 },
    posted: { type: String, default: "—" },
    postedTs: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Active", "Draft", "Closed"],
      default: "Draft",
    },
    qualifications: { type: [String], default: [] },
    responsibilities: { type: [String], default: [] },
    views: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    recruitEndTs: { type: Number, default: 0 },
    team: {
      type: [
        new Schema<JobTeamMember>(
          {
            name: { type: String, default: "" },
            initials: { type: String, default: "" },
            avatarBg: { type: String, default: "#3A4A5B" },
            avatarFg: { type: String, default: "#CFE3F5" },
            roleLabel: { type: String, default: "" },
            badge: { type: String, default: "" },
            badgeTone: { type: String, default: "default" },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    screeningOn: { type: Boolean, default: false },
    screeningThreshold: { type: Number, default: 80 },
  },
  { timestamps: true },
);

export const JobModel: Model<JobDoc> =
  (models.Job as Model<JobDoc>) ?? model<JobDoc>("Job", jobSchema);
