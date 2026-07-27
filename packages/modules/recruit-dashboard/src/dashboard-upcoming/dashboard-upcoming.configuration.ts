import type { ListRendererConfig } from "@recruit/shared";

const ID = "Recruit.DashboardUpcoming.Component";

const INTERVIEWS_LINK = {
  id: ID,
  linkType: "route" as const,
  routeId: "Recruit.Interviews.Route",
  target: "_self" as const,
  underline: "none" as const,
  color: "inherit" as const,
};

export const DashboardUpcomingConfiguration: ListRendererConfig = {
  title: { name: "title" },
  headerLink: { icon: "add", link: INTERVIEWS_LINK },
  variant: "inset",
  filterParam: "range",
  headerGap: "14px",
  row: {
    keyPath: "id",
    // The whole left block is one entity: tile, name, then the role · round line.
    title: {
      type: "entity",
      shape: "square",
      size: 36,
      hashPath: "name",
      title: "name",
      subtitle: "meta",
      avatarSx: { borderRadius: "10px", fontSize: 12 },
      titleSx: { fontSize: 13.5, fontWeight: 600 },
      subtitleSx: { fontSize: 12, color: "text.secondary" },
    },
    trailing: {
      type: "date",
      path: "scheduledAt",
      options: { hour: "numeric", minute: "2-digit" },
      sx: {
        flex: "none",
        fontSize: 11.5,
        fontWeight: 600,
        color: "surface.textMuted",
        background: "surface.tint",
        p: "4px 10px",
        borderRadius: "999px",
      },
    },
  },
  footerLink: { label: { name: "viewAll" }, link: INTERVIEWS_LINK },
  emptyText: { name: "empty" },
  skeletonRows: 3,
};
