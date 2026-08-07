export interface BreadcrumbConfig {
  /** Leading house glyph, linking to the workspace root. */
  home?: { routeId: string };
  /** Above this many crumbs the middle collapses to an ellipsis. */
  collapseAfter?: number;
  /**
   * Route id → translation key. A route absent from this map contributes no
   * crumb, which is how bare `:id` segments and layout-only nodes stay out of
   * the trail.
   */
  routes: Record<string, string>;
}

export const BreadcrumbConfiguration: BreadcrumbConfig = {
  home: { routeId: "Recruit.Root" },
  collapseAfter: 4,
  routes: {
    "Recruit.Clients.Route": "clients",
    "Recruit.ClientNew.Route": "clientNew",
    "Recruit.ClientEdit.Route": "clientEdit",
    "Recruit.ClientDetail.Route": "clientDetail",
    "Recruit.Jobs.Route": "jobs",
    "Recruit.JobNew.Route": "jobNew",
    "Recruit.JobEdit.Route": "jobEdit",
    "Recruit.JobDetail.Route": "jobDetail",
    "Recruit.Candidates.Route": "candidates",
    "Recruit.CandidateNew.Route": "candidateNew",
    "Recruit.CandidateBoard.Route": "candidateBoard",
    "Recruit.CandidateImport.Route": "candidateImport",
    "Recruit.CandidateEdit.Route": "candidateEdit",
    "Recruit.CandidateDetail.Route": "candidateDetail",
    "Recruit.Contacts.Route": "contacts",
    "Recruit.ContactNew.Route": "contactNew",
    "Recruit.ContactEdit.Route": "contactEdit",
    "Recruit.ContactDetail.Route": "contactDetail",
    "Recruit.Settings.Route": "settings",
    "Recruit.SettingsMembers.Route": "settingsMembers",
    "Recruit.SettingsBranding.Route": "settingsBranding",
    "Recruit.SettingsLocalization.Route": "settingsLocalization",
    "Recruit.SettingsRoles.Route": "settingsRoles",
    "Recruit.EmailTemplates.Route": "emailTemplates",
    "Recruit.SettingsIntegrations.Route": "settingsIntegrations",
    "Recruit.SettingsBilling.Route": "settingsBilling",
    "Recruit.SettingsSecurity.Route": "settingsSecurity",
    "Recruit.SettingsAuditLog.Route": "settingsAuditLog",
    "Recruit.Profile.Route": "profile",
    "Recruit.ProfileNotifications.Route": "profileNotifications",
    "Recruit.ProfileSecurity.Route": "profileSecurity",
    "Recruit.ProfileCalendar.Route": "profileCalendar",
    "Recruit.ProfileAppearance.Route": "profileAppearance",
    "Recruit.ProfileLanguage.Route": "profileLanguage",
  },
};
