import type { ListRendererConfig } from "@recruit/shared";

const ID = "Recruit.DashboardPriorities.Component";

export const DashboardPrioritiesConfiguration: ListRendererConfig = {
  title: { name: "title" },
  badge: { name: "badge" },
  variant: "divided",
  headerGap: "8px",
  dense: true,
  divided: true,
  row: {
    keyPath: "key",
    leading: { type: "dot", size: 8, glow: true },
    // Each priority has its own sentence, so the key comes from the row.
    title: {
      type: "static-translation",
      id: ID,
      keyPath: "key",
      keyPrefix: "items.",
      value: "count",
    },
    chips: {
      type: "static-translation",
      id: ID,
      keyPath: "tone",
      keyPrefix: "tones.",
      sx: {
        flex: "none",
        fontSize: 10.5,
        fontWeight: 700,
        color: "surface.primarySoftFg",
        background: "surface.primarySoftBg",
        border: "1px solid",
        borderColor: "surface.primarySoftBorder",
        p: "2.5px 9px",
        borderRadius: "999px",
      },
    },
  },
  emptyText: { name: "empty" },
  skeletonRows: 4,
};
