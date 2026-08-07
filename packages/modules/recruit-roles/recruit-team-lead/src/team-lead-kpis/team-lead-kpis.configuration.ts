import type { StatCardRendererConfig } from "@recruit/shared";

/** The four metrics this role opens the day on. */
export const TeamLeadKpisConfiguration: StatCardRendererConfig[] = [
  {
    label: { name: "kpis.pendingApproval" },
    value: { type: "text", path: "pendingApproval" },
    delta: { name: "kpis.pendingApprovalDelta", value: "pendingApprovalDelta" },
    tone: "warning",
    icon: { name: "rate-review", tone: "warning" },
  },
  {
    label: { name: "kpis.teamSubmissions" },
    value: { type: "text", path: "teamSubmissions" },
    delta: { name: "kpis.teamSubmissionsDelta", value: "teamSubmissionsDelta" },
    tone: "primary",
    icon: { name: "send", tone: "primary" },
  },
  {
    label: { name: "kpis.interviewConversion" },
    value: { type: "text", path: "interviewConversion" },
    delta: { name: "kpis.interviewConversionDelta", value: "interviewConversionDelta" },
    tone: "success",
    icon: { name: "percent", tone: "success" },
  },
  {
    label: { name: "kpis.slaBreaches" },
    value: { type: "text", path: "slaBreaches" },
    delta: { name: "kpis.slaBreachesDelta", value: "slaBreachesDelta" },
    tone: "error",
    icon: { name: "timer", tone: "error" },
  },
];
