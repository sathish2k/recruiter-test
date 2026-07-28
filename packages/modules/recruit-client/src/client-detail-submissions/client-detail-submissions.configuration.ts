import type { ListRendererConfig } from "@recruit/shared";

const ID = "Recruit.ClientDetailSubmissions.Component";

export const ClientDetailSubmissionsConfiguration: ListRendererConfig = {
  title: { name: "submissions.title" },
  titleScale: "panel",
  icon: "fact-check",
  headerTextLink: {
    label: { name: "submissions.viewAll" },
    link: { routeId: "Recruit.Candidates.Route" },
  },
  headerGap: "14px",
  variant: "inset",
  row: {
    keyPath: "id",
    leading: {
      type: "entity",
      shape: "circle",
      size: 34,
      avatarOnly: true,
      hashPath: "name",
      title: "name",
    },
    title: { type: "text", path: "name" },
    chips: { type: "ai-match", variant: "pill", path: "matchScore", prefix: "AI ", suffix: "%" },
    description: { type: "text", path: "meta" },
    action: {
      type: "actions",
      actions: [
        {
          button: true,
          id: ID,
          icon: "fact-check",
          label: { name: "submissions.record" },
          routeId: "Recruit.Candidates.Route",
        },
      ],
    },
  },
  emptyText: { name: "submissions.empty" },
};
