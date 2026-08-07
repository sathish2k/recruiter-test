import type { StatCardRendererConfig } from "@recruit/shared";

/** The four metrics this role opens the day on. */
export const AdminKpisConfiguration: StatCardRendererConfig[] = [
  {
    label: { name: "kpis.seatsUsed" },
    value: { type: "text", path: "seatsUsed" },
    delta: { name: "kpis.seatsUsedDelta", value: "seatsUsedDelta" },
    tone: "primary",
    icon: { name: "group", tone: "primary" },
  },
  {
    label: { name: "kpis.securityScore" },
    value: { type: "text", path: "securityScore" },
    delta: { name: "kpis.securityScoreDelta", value: "securityScoreDelta" },
    tone: "success",
    icon: { name: "shield", tone: "success" },
  },
  {
    label: { name: "kpis.integrations" },
    value: { type: "text", path: "integrations" },
    delta: { name: "kpis.integrationsDelta", value: "integrationsDelta" },
    tone: "warning",
    icon: { name: "hub", tone: "warning" },
  },
  {
    label: { name: "kpis.aiCredits" },
    value: { type: "text", path: "aiCredits" },
    delta: { name: "kpis.aiCreditsDelta", value: "aiCreditsDelta" },
    tone: "violet",
    icon: { name: "auto-awesome", tone: "violet" },
  },
];
