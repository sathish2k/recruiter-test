import type { EntityRendererConfig } from "@recruit/shared";

/** The rail's client card — who this contact works for, and that client's
 * headline figures. */
export interface ContactDetailClientConfiguration {
  entity: EntityRendererConfig;
  routeId: string;
  stats: { key: string; label: { name: string }; path: string; accent?: boolean }[];
}

export const ContactDetailClientConfiguration: ContactDetailClientConfiguration = {
  entity: {
    type: "entity",
    shape: "square",
    size: 38,
    hashPath: "name",
    title: "name",
    subtitle: "metaLine",
    titleSx: { fontSize: 13.5, fontWeight: 700 },
    subtitleSx: { fontSize: 11, mt: "1px" },
  },
  routeId: "Recruit.ClientDetail.Route",
  stats: [
    { key: "openJobs", label: { name: "client.openJobs" }, path: "openJobs" },
    { key: "candidates", label: { name: "client.candidates" }, path: "candidates" },
    {
      key: "waiting",
      label: { name: "client.waiting" },
      path: "waitingFeedback",
      accent: true,
    },
  ],
};
