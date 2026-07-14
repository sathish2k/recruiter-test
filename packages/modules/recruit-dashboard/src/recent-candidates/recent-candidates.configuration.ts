import type { TableRendererConfig } from "@recruit/shared";

const STAGE_PILLS = {
  Sourced: {
    fg: "#C9C5BD",
    bg: "rgba(255,255,255,.07)",
    border: "rgba(255,255,255,.14)",
  },
  Screened: {
    fg: "#9BB8D9",
    bg: "rgba(90,130,180,.14)",
    border: "rgba(90,130,180,.35)",
  },
  Shortlisted: {
    fg: "#C99BE0",
    bg: "rgba(160,110,200,.14)",
    border: "rgba(160,110,200,.35)",
  },
  Interviewing: {
    fg: "#F0C27C",
    bg: "rgba(214,155,60,.14)",
    border: "rgba(214,155,60,.35)",
  },
  Offer: {
    fg: "#8FD6AC",
    bg: "rgba(78,168,116,.14)",
    border: "rgba(78,168,116,.35)",
  },
  Rejected: {
    fg: "#E89A9A",
    bg: "rgba(200,80,80,.14)",
    border: "rgba(200,80,80,.35)",
  },
};

export const RecentCandidatesConfiguration: TableRendererConfig = {
  header: {
    icon: "group",
    title: "title",
    subtitle: "subtitle",
    // "See all" → Candidates, carrying a sort-by-created-date query param.
    action: {
      label: { name: "viewAll" },
      routeId: "Recruit.Candidates.Route",
      queryParams: {
        sortKey: { type: "static", value: "createdAt" },
        sortDir: { type: "static", value: "desc" },
      },
    },
    actionIcon: "arrow-forward",
  },
  rowRouteId: "Recruit.Candidates.Route",
  columns: [
    {
      label: { name: "columns.candidate" },
      value: {
        type: "entity",
        shape: "circle",
        bgPath: "avatarBg",
        fgPath: "avatarFg",
        textPath: "initials",
        title: "name",
      },
    },
    {
      label: { name: "columns.role" },
      value: { type: "string", path: "role", sx: { color: "#C9C5BD" } },
    },
    {
      label: { name: "columns.client" },
      value: { type: "string", path: "client", sx: { color: "#9A968E" } },
    },
    {
      label: { name: "columns.match" },
      value: {
        type: "ai-match",
        path: "match",
        suffix: "%",
        colorPath: "matchColor",
      },
    },
    {
      label: { name: "columns.interview" },
      value: { type: "string", path: "interview", sx: { color: "#C9C5BD" } },
    },
    {
      label: { name: "columns.status" },
      value: { type: "pill", path: "stage", styles: STAGE_PILLS },
    },
  ],
};
