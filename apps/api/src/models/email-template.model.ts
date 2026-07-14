import { type Model, model, models, Schema } from "mongoose";

export interface EmailTemplateDoc {
  agencyId: string;
  key: string;
  icon: string;
  name: string;
  description: string;
  subject: string;
  variables: string[];
  body: string[];
  cta: string;
  footer: string;
  enabled: boolean;
}

const emailTemplateSchema = new Schema<EmailTemplateDoc>(
  {
    agencyId: { type: String, required: true, index: true },
    key: { type: String, required: true },
    icon: { type: String, default: "mail" },
    name: { type: String, default: "" },
    description: { type: String, default: "" },
    subject: { type: String, default: "" },
    variables: { type: [String], default: [] },
    body: { type: [String], default: [] },
    cta: { type: String, default: "" },
    footer: { type: String, default: "" },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const EmailTemplateModel: Model<EmailTemplateDoc> =
  (models.EmailTemplate as Model<EmailTemplateDoc>) ??
  model<EmailTemplateDoc>("EmailTemplate", emailTemplateSchema);
