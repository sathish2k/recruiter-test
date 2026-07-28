import type { ListRowConfig } from "@recruit/shared";

/** The "waiting on <name>" card: SLA strip in the header, submissions below. */
export interface ContactDetailWaitingConfiguration {
  icon: string;
  title: { name: string };
  slaLabel: { name: string };
  remainingLabel: { name: string };
  viewAll: { label: { name: string }; routeId: string };
  emptyText: { name: string };
  row: ListRowConfig;
}

const ID = "Recruit.ContactDetailWaiting.Component";

export const ContactDetailWaitingConfiguration: ContactDetailWaitingConfiguration = {
  icon: "fact-check",
  title: { name: "waiting.title" },
  slaLabel: { name: "waiting.sla" },
  remainingLabel: { name: "waiting.remaining" },
  viewAll: { label: { name: "waiting.viewAll" }, routeId: "Recruit.Candidates.Route" },
  emptyText: { name: "waiting.empty" },
  row: {
    keyPath: "id",
    leading: {
      type: "entity",
      shape: "circle",
      size: 36,
      avatarOnly: true,
      hashPath: "name",
      title: "name",
    },
    title: { type: "text", path: "name" },
    description: { type: "text", path: "meta" },
    chips: { type: "ai-match", variant: "pill", path: "matchScore", prefix: "AI ", suffix: "%" },
    action: {
      type: "actions",
      actions: [
        {
          button: true,
          id: ID,
          icon: "fact-check",
          label: { name: "waiting.review" },
          routeId: "Recruit.Candidates.Route",
        },
      ],
    },
  },
};
