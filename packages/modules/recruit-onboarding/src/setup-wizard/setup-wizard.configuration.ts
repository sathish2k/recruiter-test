import type { LinkRendererConfig } from "@recruit/shared";

/**
 * The quick-pick lists the wizard offers. Deliberately short — the design says
 * so, and the full catalogues live in Settings → Workspace.
 */
const timezones = [
  { value: "Asia/Kolkata", label: "Asia/Kolkata", meta: "IST · UTC+5:30" },
  { value: "Asia/Dubai", label: "Asia/Dubai", meta: "UTC+4" },
  { value: "Europe/London", label: "Europe/London", meta: "UTC+1" },
  { value: "America/New_York", label: "New York", meta: "UTC−4" },
  { value: "Asia/Singapore", label: "Singapore", meta: "UTC+8" },
];

const currencies = [
  { value: "INR", symbol: "₹", label: "Indian rupee" },
  { value: "USD", symbol: "$", label: "US dollar" },
  { value: "GBP", symbol: "£", label: "Pound" },
  { value: "AED", symbol: "د.إ", label: "Dirham" },
];

const dateFormats = [
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY", meta: "22/06/2026" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY", meta: "06/22/2026" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD", meta: "2026-06-22" },
];

const roles = ["Admin", "Profile lead", "Sourcer", "Finance"];

const links: Record<string, LinkRendererConfig> = {
  dashboard: { routeId: "Recruit.Root", underline: "none" },
};

export const SetupWizardConfiguration = {
  timezones,
  currencies,
  dateFormats,
  roles,
  links,
};
