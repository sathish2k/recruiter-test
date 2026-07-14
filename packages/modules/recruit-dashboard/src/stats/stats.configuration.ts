import type { StatCardRendererConfig } from "@recruit/shared";

const value = (path: string) =>
  ({ type: "number", path, sx: { fontSize: 27 } }) as const;

// Filters passed to the target screen via the URL `filters` param (the format
// useFilters reads). Values match each screen's filter keys.
const filters = (f: Record<string, unknown>) => ({
  filters: { type: "static" as const, value: JSON.stringify(f) },
});

export const StatsConfiguration: StatCardRendererConfig[] = [
  {
    label: { name: "openRoles" },
    value: value("openRoles"),
    delta: { name: "delta", value: "openRolesDelta", variant: "pill" },
    link: {
      routeId: "Recruit.Jobs.Route",
      queryParams: filters({ status: ["Active"] }),
    },
  },
  {
    label: { name: "activeCandidates" },
    value: value("activeCandidates"),
    delta: { name: "delta", value: "activeCandidatesDelta", variant: "pill" },
    link: {
      routeId: "Recruit.Candidates.Route",
      queryParams: filters({
        stage: ["Sourced", "Screened", "Shortlisted", "Interviewing", "Offer"],
      }),
    },
  },
  {
    label: { name: "hires" },
    value: value("hires"),
    delta: { name: "delta", value: "hiresDelta", variant: "pill" },
    link: {
      routeId: "Recruit.Candidates.Route",
      queryParams: filters({ stage: ["Offer"] }),
    },
  },
];
