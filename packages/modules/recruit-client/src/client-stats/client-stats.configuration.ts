import type { StatCardRendererConfig } from "@recruit/shared";

export const ClientStatsConfiguration: StatCardRendererConfig[] = [
  {
    label: { name: "stats.activeClients" },
    value: { type: "number", path: "active" },
    delta: { name: "stats.hiring", value: "hiring" },
  },
  {
    label: { name: "stats.requirements" },
    value: { type: "number", path: "openRoles" },
    delta: { name: "stats.requirementsDelta" },
  },
  {
    label: { name: "stats.placements" },
    value: { type: "number", path: "placements" },
    delta: { name: "stats.placementsDelta" },
  },
];
