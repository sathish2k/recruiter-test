import { type Model, model, models, Schema } from "mongoose";
import type { UserRole } from "@recruit/types";

export interface UserDoc {
  agencyId: string;
  email: string;
  name: string;
  role: UserRole;
  passwordHash: string;
}

const userSchema = new Schema<UserDoc>(
  {
    agencyId: { type: String, required: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    role: { type: String, enum: ["lead", "recruiter"], required: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
);

userSchema.index({ agencyId: 1, role: 1 });

export const UserModel: Model<UserDoc> =
  (models.User as Model<UserDoc>) ?? model<UserDoc>("User", userSchema);
