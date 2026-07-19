import type { AccessRule, Configuration } from "@recruit/sdk";

const OPS_ACCESS: AccessRule = { resource: "candidates" };
const COMMISSIONS_ACCESS: AccessRule = { resource: "commissions" };
const AUDIT_ACCESS: AccessRule = { resource: "audit", action: ["read"] };

export const OpsPages: Record<string, Configuration> = {
  "Recruit.TeamActivity.Page": {
    id: "Recruit.TeamActivity.Page",
    elements: [
      {
        id: "team-activity",
        type: "component",
        componentType: "Recruit.TeamActivity.Component",
        gridItem: { size: 12 },
        access: OPS_ACCESS,
      },
    ],
  },
  "Recruit.Interviews.Page": {
    id: "Recruit.Interviews.Page",
    elements: [
      {
        id: "interviews",
        type: "component",
        componentType: "Recruit.Interviews.Component",
        gridItem: { size: 12 },
        access: OPS_ACCESS,
      },
    ],
  },
  "Recruit.Placements.Page": {
    id: "Recruit.Placements.Page",
    elements: [
      {
        id: "placements",
        type: "component",
        componentType: "Recruit.Placements.Component",
        gridItem: { size: 12 },
        access: OPS_ACCESS,
      },
    ],
  },
  "Recruit.Commissions.Page": {
    id: "Recruit.Commissions.Page",
    elements: [
      {
        id: "commissions",
        type: "component",
        componentType: "Recruit.Commissions.Component",
        gridItem: { size: 12 },
        access: COMMISSIONS_ACCESS,
      },
    ],
  },
  "Recruit.AuditLog.Page": {
    id: "Recruit.AuditLog.Page",
    elements: [
      {
        id: "audit-log",
        type: "component",
        componentType: "Recruit.AuditLog.Component",
        gridItem: { size: 12 },
        access: AUDIT_ACCESS,
      },
    ],
  },
};
