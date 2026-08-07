import type { HealthCardRendererConfig } from "@recruit/shared";

export const TeamLeadTeamHealthConfiguration: HealthCardRendererConfig = {
  title: "title",
  icon: "groups",
  tone: "info",
  layout: "bands",
  summary: { valuePath: "capacity", label: "capacityLabel" },
  paths: { label: "label", value: "value", note: "note", tone: "tone", percent: "percent" },
};
