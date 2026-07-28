import type { ListRendererConfig } from "@recruit/shared";

/**
 * The rail's audit feed: chips filter it, rows group under a day heading, and
 * each entry carries the glyph for its category — all resolved server-side, so
 * the row config just reads the fields.
 */
export const ClientDetailActivityConfiguration: ListRendererConfig = {
  title: { name: "activity.title" },
  titleScale: "rail",
  icon: "sparkle",
  headerTextLink: {
    label: { name: "activity.viewAll" },
    link: { routeId: "Recruit.SettingsAuditLog.Route" },
  },
  headerGap: "12px",
  variant: "plain",
  filters: {
    param: "activity",
    variant: "chips",
    options: [
      { label: "activity.filters.all", value: "all" },
      { label: "activity.filters.recruitment", value: "recruitment" },
      { label: "activity.filters.billing", value: "billing" },
    ],
  },
  filterParam: "activity",
  groupPath: "day",
  groupLabelPrefix: "activity.days.",
  row: {
    keyPath: "id",
    leading: { type: "icon", path: "icon", colorPath: "iconColor", size: 15 },
    title: { type: "text", path: "event", highlightPath: "subject" },
  },
  emptyText: { name: "activity.empty" },
};
