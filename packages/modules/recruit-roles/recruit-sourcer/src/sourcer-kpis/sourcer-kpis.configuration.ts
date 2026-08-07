import type { StatCardRendererConfig } from "@recruit/shared";

/** The four metrics this role opens the day on. */
export const SourcerKpisConfiguration: StatCardRendererConfig[] = [
  {
    label: { name: "kpis.candidatesAdded" },
    value: { type: "text", path: "candidatesAdded" },
    delta: { name: "kpis.candidatesAddedDelta", value: "candidatesAddedDelta" },
    tone: "primary",
    icon: { name: "person-add", tone: "primary" },
  },
  {
    label: { name: "kpis.profilesContacted" },
    value: { type: "text", path: "profilesContacted" },
    delta: { name: "kpis.profilesContactedDelta", value: "profilesContactedDelta" },
    tone: "info",
    icon: { name: "send", tone: "info" },
  },
  {
    label: { name: "kpis.connectionRequests" },
    value: { type: "text", path: "connectionRequests" },
    delta: { name: "kpis.connectionRequestsDelta", value: "connectionRequestsDelta" },
    tone: "violet",
    icon: { name: "how-to-reg", tone: "violet" },
  },
  {
    label: { name: "kpis.responseRate" },
    value: { type: "text", path: "responseRate" },
    delta: { name: "kpis.responseRateDelta", value: "responseRateDelta" },
    tone: "success",
    icon: { name: "percent", tone: "success" },
  },
];
