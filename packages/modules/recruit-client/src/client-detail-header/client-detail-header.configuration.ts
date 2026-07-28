import type { DetailHeaderConfig } from "@recruit/shared";

/** The identity row (shared with the contact screen) plus this screen's hero. */
export interface ClientDetailHeaderConfiguration {
  header: DetailHeaderConfig;
  /** The accent strip under the identity row: how long the client has sat on
   * submitted CVs, against the feedback SLA. */
  hero: {
    icon: string;
    title: { name: string };
    slaLabel: { name: string };
    elapsedLabel: { name: string };
    cta: { name: string };
  };
}

const ID = "Recruit.ClientDetailHeader.Component";

const CLIENT_PARAM = { id: { type: "dynamic" as const, path: "id" } };

export const ClientDetailHeaderConfiguration: ClientDetailHeaderConfiguration = {
  header: {
    // `hashPath` picks a stable tile colour from the name — no literal hexes.
    entity: {
      type: "entity",
      shape: "square",
      size: 56,
      hashPath: "name",
      title: "name",
      subtitle: "subtitleLine",
      titleSx: { fontSize: 22, fontWeight: 700, letterSpacing: "-.01em" },
      subtitleSx: { fontSize: 13, mt: "5px" },
    },
    chips: [
      {
        type: "status",
        id: ID,
        path: "status",
        dot: true,
        labels: {
          prospect: "status.prospect",
          active: "status.active",
          hiring: "status.hiring",
          paused: "status.paused",
          inactive: "status.inactive",
          blacklisted: "status.blacklisted",
        },
        colors: {
          prospect: "info",
          active: "success",
          hiring: "success",
          paused: "default",
          inactive: "default",
          blacklisted: "error",
        },
      },
      {
        type: "status",
        id: ID,
        path: "attention",
        dot: true,
        variant: "outlined",
        labels: {
          on_track: "attention.on_track",
          waiting_feedback: "attention.waiting_feedback",
          invoice_overdue: "attention.invoice_overdue",
          dormant: "attention.dormant",
        },
        colors: {
          on_track: "success",
          waiting_feedback: "warning",
          invoice_overdue: "error",
          dormant: "default",
        },
      },
    ],
    actions: [
      {
        type: "portal",
        icon: "share",
        label: { name: "actions.portal" },
        routeId: "Recruit.Clients.Route",
      },
      {
        type: "report",
        icon: "sparkle",
        label: { name: "actions.report" },
        routeId: "Recruit.Clients.Route",
      },
    ],
    primaryAction: {
      type: "addRole",
      icon: "add",
      label: { name: "actions.addRole" },
      routeId: "Recruit.JobNew.Route",
    },
    menuActions: [
      {
        type: "edit",
        icon: "edit",
        label: { name: "actions.edit" },
        routeId: "Recruit.ClientEdit.Route",
        params: CLIENT_PARAM,
      },
      {
        type: "addContact",
        icon: "person-add",
        label: { name: "actions.addContact" },
        routeId: "Recruit.ContactNew.Route",
      },
      {
        type: "viewJobs",
        icon: "work",
        label: { name: "actions.viewJobs" },
        routeId: "Recruit.Jobs.Route",
        queryParams: CLIENT_PARAM,
      },
    ],
  },
  hero: {
    icon: "hourglass",
    title: { name: "hero.title" },
    slaLabel: { name: "hero.sla" },
    elapsedLabel: { name: "hero.elapsed" },
    cta: { name: "hero.cta" },
  },
};
