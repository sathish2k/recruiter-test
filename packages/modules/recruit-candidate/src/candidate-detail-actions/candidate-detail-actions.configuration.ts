export interface CandidateDetailActionsConfiguration {
  /** Action key → ICON_REGISTRY name. */
  icons: Record<string, string>;
  editRouteId: string;
}

export const CandidateDetailActionsConfiguration: CandidateDetailActionsConfiguration = {
  editRouteId: "Recruit.CandidateEdit.Route",
  icons: {
    slaBreached: "notifications-active",
    noResume: "upload-file",
    noConsent: "shield",
    noRequirement: "work",
    noContact: "mail",
  },
};
