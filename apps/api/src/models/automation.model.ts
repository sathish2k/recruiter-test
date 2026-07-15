import { type Model, model, models, Schema } from "mongoose";

export interface AutomationDoc {
  agencyId: string;
  key: string;
  icon: string;
  title: string;
  description: string;
  enabled: boolean;
  runs: number;
  meta: string;
}

const automationSchema = new Schema<AutomationDoc>(
  {
    agencyId: { type: String, required: true, index: true },
    key: { type: String, required: true },
    icon: { type: String, default: "sparkle" },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    enabled: { type: Boolean, default: false },
    runs: { type: Number, default: 0 },
    meta: { type: String, default: "" },
  },
  { timestamps: true },
);

automationSchema.index({ agencyId: 1, key: 1 }, { unique: true });

export const AutomationModel: Model<AutomationDoc> =
  (models.Automation as Model<AutomationDoc>) ??
  model<AutomationDoc>("Automation", automationSchema);
