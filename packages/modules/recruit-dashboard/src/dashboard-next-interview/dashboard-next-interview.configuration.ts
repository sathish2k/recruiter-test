import type { CardRendererConfig } from "@recruit/shared";

const ID = "Recruit.DashboardNextInterview.Component";

export const DashboardNextInterviewConfiguration: CardRendererConfig = {
  variant: "feature",
  // No booking, no card — better an absent rail slot than an empty shell.
  showPath: "name",
  header: {
    kicker: { name: "kicker", variant: "feature" },
    aside: {
      type: "static-translation",
      id: ID,
      key: "countdown",
      value: "startsInMinutes",
      sx: { fontSize: 12.5, fontWeight: 600, color: "surface.primarySoftFg" },
    },
  },
  body: [
    {
      value: {
        type: "entity",
        shape: "circle",
        size: 44,
        hashPath: "name",
        title: "name",
        subtitle: "role",
        avatarSx: { fontSize: 14 },
        titleSx: { fontSize: 15.5, fontWeight: 700 },
        subtitleSx: { fontSize: 12.5, color: "surface.textMuted" },
      },
      sx: { mb: "14px" },
    },
    { divider: true },
    {
      icon: { name: "schedule", size: 16, color: "var(--mui-palette-surface-textSecondary)" },
      value: {
        type: "date",
        path: "startsAt",
        options: { weekday: "short", hour: "numeric", minute: "2-digit" },
        sx: { fontSize: 12.5, color: "surface.textMuted" },
      },
      sx: { mb: "14px" },
    },
  ],
  footer: {
    actions: [
      {
        label: { name: "actions.join" },
        icon: "laptop",
        variant: "primary",
        action: "joinMeeting",
      },
      { label: { name: "actions.copy" }, icon: "link", variant: "outlined", action: "copyInvite" },
    ],
    trailingAction: {
      icon: "person",
      link: {
        id: ID,
        linkType: "route",
        routeId: "Recruit.Candidates.Route",
        target: "_self",
        underline: "none",
        color: "inherit",
      },
    },
  },
};
