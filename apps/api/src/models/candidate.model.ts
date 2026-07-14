import { type Model, model, models, Schema } from "mongoose";

export interface ExperienceEntry {
  title: string;
  company: string;
  period: string;
  blurb: string;
}

export interface EducationEntry {
  icon: string;
  title: string;
  sub: string;
}

export interface AttachmentEntry {
  icon: string;
  color: string;
  title: string;
  sub: string;
  action: string;
}

export interface TeamNoteEntry {
  initials: string;
  avatarBg: string;
  avatarFg: string;
  text: string;
  author: string;
  when: string;
}

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
  phone: string;
  location: string;
  linkedin: string;
  skills: string[];
  notes: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  attachments: AttachmentEntry[];
  strengths: string[];
  gaps: string[];
  teamNotes: TeamNoteEntry[];
  milestoneNotes: string[];
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
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    skills: { type: [String], default: [] },
    notes: { type: String, default: "" },
    experience: {
      type: [
        new Schema<ExperienceEntry>(
          {
            title: { type: String, default: "" },
            company: { type: String, default: "" },
            period: { type: String, default: "" },
            blurb: { type: String, default: "" },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    education: {
      type: [
        new Schema<EducationEntry>(
          {
            icon: { type: String, default: "school" },
            title: { type: String, default: "" },
            sub: { type: String, default: "" },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    attachments: {
      type: [
        new Schema<AttachmentEntry>(
          {
            icon: { type: String, default: "pdf" },
            color: { type: String, default: "#E89A9A" },
            title: { type: String, default: "" },
            sub: { type: String, default: "" },
            action: { type: String, default: "download" },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    strengths: { type: [String], default: [] },
    gaps: { type: [String], default: [] },
    teamNotes: {
      type: [
        new Schema<TeamNoteEntry>(
          {
            initials: { type: String, default: "" },
            avatarBg: { type: String, default: "#3A4A5B" },
            avatarFg: { type: String, default: "#CFE3F5" },
            text: { type: String, default: "" },
            author: { type: String, default: "" },
            when: { type: String, default: "" },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    milestoneNotes: { type: [String], default: [] },
  },
  { timestamps: true },
);

export const CandidateModel: Model<CandidateDoc> =
  (models.Candidate as Model<CandidateDoc>) ??
  model<CandidateDoc>("Candidate", candidateSchema);
