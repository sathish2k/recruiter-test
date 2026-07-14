import type { AccessAction, UserRole } from "@recruit/types";
import { type Model, model, models, Schema } from "mongoose";

export interface ResourcePermission {
  resource: string;
  actions: AccessAction[];
}

export interface RolePermissionDoc {
  agencyId: string;
  role: UserRole;
  permissions: ResourcePermission[];
}

const rolePermissionSchema = new Schema<RolePermissionDoc>(
  {
    agencyId: { type: String, required: true, index: true },
    role: {
      type: String,
      enum: ["admin", "lead", "employee", "client"],
      required: true,
    },
    permissions: {
      type: [
        new Schema<ResourcePermission>(
          {
            resource: { type: String, required: true },
            actions: {
              type: [String],
              enum: ["read", "create", "edit", "update", "delete"],
              default: [],
            },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
  },
  { timestamps: true },
);

rolePermissionSchema.index({ agencyId: 1, role: 1 }, { unique: true });

export const RolePermissionModel: Model<RolePermissionDoc> =
  (models.RolePermission as Model<RolePermissionDoc>) ??
  model<RolePermissionDoc>("RolePermission", rolePermissionSchema);
