import type { SegmentedFilterRendererConfig } from "@recruit/shared";

const ID = "Recruit.DashboardRailFilter.Component";

export const DashboardRailFilterConfiguration: SegmentedFilterRendererConfig = {
  // Sibling rail lists read the same param (see ListRenderer.filterParam).
  param: "range",
  options: [
    { value: "today", label: "options.today", dotColor: "#FF8A3C" },
    { value: "week", label: "options.week" },
  ],
  cta: {
    label: { name: "cta" },
    link: {
      id: ID,
      linkType: "route",
      routeId: "Recruit.Interviews.Route",
      target: "_self",
      underline: "none",
      color: "inherit",
    },
  },
};
