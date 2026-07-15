import { type Model, model, models, Schema } from "mongoose";

export interface ScreeningSettingsDoc {
  agencyId: string;
  threshold: number;
  autoScore: boolean;
  autoForward: boolean;
}

const screeningSettingsSchema = new Schema<ScreeningSettingsDoc>(
  {
    agencyId: { type: String, required: true, unique: true, index: true },
    threshold: { type: Number, default: 80 },
    autoScore: { type: Boolean, default: true },
    autoForward: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const ScreeningSettingsModel: Model<ScreeningSettingsDoc> =
  (models.ScreeningSettings as Model<ScreeningSettingsDoc>) ??
  model<ScreeningSettingsDoc>("ScreeningSettings", screeningSettingsSchema);
