import type { DetailHeaderConfig } from "@recruit/shared";

const ID = "Recruit.JobDetailHeader.Component";
const JOB_PARAM = { id: { type: "dynamic" as const, path: "id" } };

export interface JobDetailHeaderConfiguration {
  header: DetailHeaderConfig;
}

/** The design's identity row: a gradient work tile, the role over its client,
 * and the salary band pinned right. */
export const JobDetailHeaderConfiguration: JobDetailHeaderConfiguration = {
  header: {
    entity: {
      type: "entity",
      shape: "square",
      size: 64,
      icon: "work",
      gradient: "linear-gradient(135deg,#FF8A3C,#E4560F)",
      fg: "#fff",
      title: "title",
      subtitle: "subtitleLine",
      avatarSx: { borderRadius: "16px" },
      titleSx: { fontSize: 24, fontWeight: 700, letterSpacing: "-.015em" },
      subtitleSx: { fontSize: 13.5, mt: "5px" },
    },
    chips: [
      {
        type: "status",
        id: ID,
        path: "status",
        dot: true,
        labels: {
          open: "chips.open",
          on_hold: "chips.on_hold",
          filled: "chips.filled",
          closed: "chips.closed",
        },
        colors: { open: "success", on_hold: "warning", filled: "info", closed: "default" },
      },
      {
        type: "status",
        id: ID,
        path: "priority",
        onlyMapped: true,
        variant: "outlined",
        labels: { high: "chips.high", critical: "chips.critical" },
        colors: { high: "warning", critical: "error" },
      },
    ],
    aside: { value: "salaryLabel", caption: "locationLine" },
    primaryAction: {
      type: "edit",
      icon: "edit",
      label: { name: "actions.edit" },
      routeId: "Recruit.JobEdit.Route",
      params: JOB_PARAM,
    },
    menuActions: [
      {
        type: "viewClient",
        icon: "domain",
        label: { name: "actions.viewClient" },
        routeId: "Recruit.ClientDetail.Route",
        params: { id: { type: "dynamic", path: "clientId" } },
      },
      {
        type: "addCandidate",
        icon: "person-add",
        label: { name: "actions.addCandidate" },
        routeId: "Recruit.CandidateNew.Route",
      },
      {
        type: "backToList",
        icon: "work",
        label: { name: "actions.backToList" },
        routeId: "Recruit.Jobs.Route",
      },
    ],
  },
};
