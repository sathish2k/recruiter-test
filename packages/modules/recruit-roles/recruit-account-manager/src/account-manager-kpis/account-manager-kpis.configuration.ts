import type { StatCardRendererConfig } from "@recruit/shared";

/** The four metrics this role opens the day on. */
export const AccountManagerKpisConfiguration: StatCardRendererConfig[] = [
  {
    label: { name: "kpis.portfolioValue" },
    value: { type: "text", path: "portfolioValue" },
    delta: { name: "kpis.portfolioValueDelta", value: "portfolioValueDelta" },
    tone: "success",
    icon: { name: "payments", tone: "success" },
  },
  {
    label: { name: "kpis.activeAccounts" },
    value: { type: "text", path: "activeAccounts" },
    delta: { name: "kpis.activeAccountsDelta", value: "activeAccountsDelta" },
    tone: "primary",
    icon: { name: "domain", tone: "primary" },
  },
  {
    label: { name: "kpis.renewalsDue" },
    value: { type: "text", path: "renewalsDue" },
    delta: { name: "kpis.renewalsDueDelta", value: "renewalsDueDelta" },
    tone: "warning",
    icon: { name: "event-repeat", tone: "warning" },
  },
  {
    label: { name: "kpis.accountHealth" },
    value: { type: "text", path: "accountHealth" },
    delta: { name: "kpis.accountHealthDelta", value: "accountHealthDelta" },
    tone: "info",
    icon: { name: "trending-up", tone: "info" },
  },
];
