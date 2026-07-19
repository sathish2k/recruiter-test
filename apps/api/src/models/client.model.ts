import { type Model, model, models, Schema } from "mongoose";

export interface ClientContact {
  name: string;
  role: string;
  email: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
}

export interface ClientAgreement {
  feeModel: string;
  guarantee: string;
  paymentTerms: string;
  renews: string;
  contractFile: string;
  signedDate: string;
}

export interface ClientActivityEntry {
  icon: string;
  text: string;
  when: string;
  tone: string;
}

export interface ClientSubmission {
  name: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  score: number;
  role: string;
  submittedWhen: string;
  sourcer: string;
  decision: "pending" | "approved" | "rejected";
  reason: string;
  exp: string;
  comp: string;
  why: string;
}

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
  since: string;
  primaryContact: string;
  placementFee: string;
  contacts: ClientContact[];
  agreement: ClientAgreement;
  activityLog: ClientActivityEntry[];
  submissions: ClientSubmission[];
  portalToken: string;
  portalExpires: number;
}

const contactSchema = new Schema<ClientContact>(
  {
    name: { type: String, default: "" },
    role: { type: String, default: "" },
    email: { type: String, default: "" },
    initials: { type: String, default: "" },
    avatarBg: { type: String, default: "#3A4A5B" },
    avatarFg: { type: String, default: "#CFE3F5" },
  },
  { _id: false },
);

const agreementSchema = new Schema<ClientAgreement>(
  {
    feeModel: { type: String, default: "" },
    guarantee: { type: String, default: "" },
    paymentTerms: { type: String, default: "" },
    renews: { type: String, default: "" },
    contractFile: { type: String, default: "" },
    signedDate: { type: String, default: "" },
  },
  { _id: false },
);

const activitySchema = new Schema<ClientActivityEntry>(
  {
    icon: { type: String, default: "check-circle" },
    text: { type: String, default: "" },
    when: { type: String, default: "" },
    tone: { type: String, default: "default" },
  },
  { _id: false },
);

const submissionSchema = new Schema<ClientSubmission>({
  name: { type: String, default: "" },
  initials: { type: String, default: "" },
  avatarBg: { type: String, default: "#4A3A5B" },
  avatarFg: { type: String, default: "#E3CFF5" },
  score: { type: Number, default: 0 },
  role: { type: String, default: "" },
  submittedWhen: { type: String, default: "" },
  sourcer: { type: String, default: "" },
  decision: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  reason: { type: String, default: "" },
  exp: { type: String, default: "" },
  comp: { type: String, default: "" },
  why: { type: String, default: "" },
});

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
    since: { type: String, default: "" },
    primaryContact: { type: String, default: "" },
    placementFee: { type: String, default: "" },
    contacts: { type: [contactSchema], default: [] },
    agreement: { type: agreementSchema, default: () => ({}) },
    activityLog: { type: [activitySchema], default: [] },
    submissions: { type: [submissionSchema], default: [] },
    portalToken: { type: String, default: "", index: true },
    portalExpires: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const ClientModel: Model<ClientDoc> =
  (models.Client as Model<ClientDoc>) ??
  model<ClientDoc>("Client", clientSchema);
