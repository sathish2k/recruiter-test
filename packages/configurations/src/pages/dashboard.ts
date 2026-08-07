import type { Configuration } from "@recruit/sdk";

/**
 * The role dashboards.
 *
 * The design draws seven of them — owner, admin, account manager, team lead,
 * recruiter, sourcer, hiring manager. They are **not** seven layouts. Every one
 * is the same spine (KPIs · status · today's work · queue + side card · chart +
 * actions · AI · activity + recents) carrying the blocks that role alone gets,
 * so this is one page whose elements each declare the permission they need.
 * The order and membership come from the design file, which is the authority —
 * `e2e/visual/dashboard.design-parity.spec.ts` reads it directly rather than
 * trusting a baseline we generated. The engine resolves the viewer's permissions
 * server-side and strips the rest before render, which means:
 *
 *  - nothing here tests a role name (see `.claude/skills/roles-permissions`);
 *  - a custom role an agency invents later gets a coherent dashboard for free,
 *    from the permissions it was given;
 *  - the *content* of each block is the API's job — `/dashboard/*` scopes its
 *    rows to the caller, so an owner's queue is commercial risk and a
 *    recruiter's is their next actions, through the same component.
 */
export const DashboardPages: Record<string, Configuration> = {
  "Recruit.Dashboard.Page": {
    id: "Recruit.Dashboard.Page",
    stackContainer: { spacing: 0 },
    elements: [
      {
        id: "dashboard-main",
        type: "configuration",
        configurationId: "Recruit.DashboardMain.Configuration",
      },
    ],
  },

  /**
   * The design's shell is a 248px rail and one content column — there is no
   * right-hand rail, so this is the whole page: the greeting, the role's own
   * dashboard, and the action tiles. Cards stack at the design's 14px gap.
   */
  "Recruit.DashboardMain.Configuration": {
    id: "Recruit.DashboardMain.Configuration",
    stackContainer: { spacing: 2.25 },
    elements: [
      {
        id: "dashboard-welcome",
        type: "component",
        componentType: "Recruit.DashboardWelcome.Component",
      },
      // Renders only while the workspace has no clients, roles or candidates —
      // the cards below it all show their own empty states behind it.
      {
        id: "dashboard-empty-workspace",
        type: "component",
        componentType: "Recruit.DashboardEmptyWorkspace.Component",
      },
      {
        id: "dashboard-owner",
        type: "configuration",
        configurationId: "Recruit.OwnerDashboard.Configuration",
        access: { resource: "dashboard", attributes: { dashboardVariant: ["owner"] } },
      },
      {
        id: "dashboard-admin",
        type: "configuration",
        configurationId: "Recruit.AdminDashboard.Configuration",
        access: { resource: "dashboard", attributes: { dashboardVariant: ["admin"] } },
      },
      {
        id: "dashboard-accountManager",
        type: "configuration",
        configurationId: "Recruit.AccountManagerDashboard.Configuration",
        access: { resource: "dashboard", attributes: { dashboardVariant: ["accountManager"] } },
      },
      {
        id: "dashboard-profileLead",
        type: "configuration",
        configurationId: "Recruit.TeamLeadDashboard.Configuration",
        access: { resource: "dashboard", attributes: { dashboardVariant: ["profileLead"] } },
      },
      {
        id: "dashboard-recruiter",
        type: "configuration",
        configurationId: "Recruit.RecruiterDashboard.Configuration",
        access: { resource: "dashboard", attributes: { dashboardVariant: ["recruiter"] } },
      },
      {
        id: "dashboard-sourcer",
        type: "configuration",
        configurationId: "Recruit.SourcerDashboard.Configuration",
        access: { resource: "dashboard", attributes: { dashboardVariant: ["sourcer"] } },
      },
      {
        id: "dashboard-hiringManager",
        type: "configuration",
        configurationId: "Recruit.HiringManagerDashboard.Configuration",
        access: { resource: "dashboard", attributes: { dashboardVariant: ["hiringManager"] } },
      },
      {
        id: "dashboard-client",
        type: "configuration",
        configurationId: "Recruit.ClientDashboard.Configuration",
        access: { resource: "dashboard", attributes: { dashboardVariant: ["client"] } },
      },
      // A custom role the agency invented matches no variant above.
      {
        id: "dashboard-generic",
        type: "configuration",
        configurationId: "Recruit.DashboardGeneric.Configuration",
        access: { resource: "dashboard", attributes: { dashboardVariant: ["generic"] } },
      },
    ],
  },

  "Recruit.DashboardGeneric.Configuration": {
    id: "Recruit.DashboardGeneric.Configuration",
    stackContainer: { spacing: 2 },
    elements: [
      {
        id: "generic-kpis",
        type: "component",
        componentType: "Recruit.DashboardStats.Component",
      },
      {
        id: "generic-queue",
        type: "component",
        componentType: "Recruit.DashboardQueue.Component",
      },
      // Every role the design draws ends on the action tiles; the tiles a
      // custom role actually gets are the ones its permissions survive.
      {
        id: "generic-quick-actions",
        type: "component",
        componentType: "Recruit.DashboardQuickActions.Component",
      },
    ],
  },

  "Recruit.OwnerDashboard.Configuration": {
    id: "Recruit.OwnerDashboard.Configuration",
    stackContainer: { spacing: 2.25 },
    elements: [
      {
        id: "owner-kpis",
        type: "component",
        componentType: "Recruit.Owner.DashboardStats.Component",
      },
      {
        id: "owner-status",
        type: "component",
        componentType: "Recruit.Owner.DashboardStatus.Component",
      },
      {
        id: "owner-today-work",
        type: "component",
        componentType: "Recruit.Owner.DashboardTodayWork.Component",
      },
      {
        id: "owner-team",
        type: "component",
        componentType: "Recruit.Owner.DashboardTeam.Component",
        access: { resource: "members", action: ["view"] },
      },
      {
        id: "owner-client-health",
        type: "component",
        componentType: "Recruit.Owner.DashboardClientHealth.Component",
        access: { resource: "clients", action: ["read"] },
      },
      {
        id: "owner-work",
        type: "configuration",
        configurationId: "Recruit.OwnerDashboardWork.Configuration",
      },
      {
        id: "owner-insights",
        type: "configuration",
        configurationId: "Recruit.OwnerDashboardInsights.Configuration",
      },
      {
        id: "owner-ai",
        type: "component",
        componentType: "Recruit.Owner.DashboardAi.Component",
        access: { resource: "ai", action: ["use"] },
      },
      {
        id: "owner-trail",
        type: "configuration",
        configurationId: "Recruit.OwnerDashboardTrail.Configuration",
      },
    ],
  },

  "Recruit.OwnerDashboardWork.Configuration": {
    id: "Recruit.OwnerDashboardWork.Configuration",
    gridContainer: { spacing: "14px", templateColumns: "minmax(0,1fr) 380px" },
    elements: [
      {
        id: "owner-queue",
        type: "component",
        componentType: "Recruit.Owner.DashboardQueue.Component",
      },
      {
        id: "owner-side",
        type: "component",
        componentType: "Recruit.Owner.DashboardSide.Component",
        access: { resource: "clients", action: ["read"] },
      },
    ],
  },

  "Recruit.OwnerDashboardInsights.Configuration": {
    id: "Recruit.OwnerDashboardInsights.Configuration",
    gridContainer: { spacing: "14px", templateColumns: "minmax(0,1fr) 380px" },
    elements: [
      {
        id: "owner-chart",
        type: "component",
        componentType: "Recruit.Owner.DashboardChart.Component",
        access: { resource: "revenue", action: ["view"] },
      },
      {
        id: "owner-quick-actions",
        type: "component",
        componentType: "Recruit.Owner.DashboardQuickActions.Component",
      },
    ],
  },

  "Recruit.OwnerDashboardTrail.Configuration": {
    id: "Recruit.OwnerDashboardTrail.Configuration",
    gridContainer: { spacing: "14px", templateColumns: "minmax(0,1fr) 380px" },
    elements: [
      {
        id: "owner-activity",
        type: "component",
        componentType: "Recruit.Owner.DashboardActivity.Component",
      },
      {
        id: "owner-recents",
        type: "component",
        componentType: "Recruit.Owner.DashboardRecents.Component",
        access: { resource: "candidates", action: ["read"] },
      },
    ],
  },

  "Recruit.AdminDashboard.Configuration": {
    id: "Recruit.AdminDashboard.Configuration",
    stackContainer: { spacing: 2.25 },
    elements: [
      {
        id: "admin-kpis",
        type: "component",
        componentType: "Recruit.Admin.DashboardStats.Component",
      },
      {
        id: "admin-status",
        type: "component",
        componentType: "Recruit.Admin.DashboardStatus.Component",
      },
      {
        id: "admin-system",
        type: "component",
        componentType: "Recruit.Admin.DashboardSystem.Component",
        access: { resource: "security", action: ["manage"] },
      },
      {
        id: "admin-today-work",
        type: "component",
        componentType: "Recruit.Admin.DashboardTodayWork.Component",
      },
      {
        id: "admin-work",
        type: "configuration",
        configurationId: "Recruit.AdminDashboardWork.Configuration",
      },
      {
        id: "admin-insights",
        type: "configuration",
        configurationId: "Recruit.AdminDashboardInsights.Configuration",
      },
      {
        id: "admin-ai",
        type: "component",
        componentType: "Recruit.Admin.DashboardAi.Component",
        access: { resource: "ai", action: ["use"] },
      },
      {
        id: "admin-trail",
        type: "configuration",
        configurationId: "Recruit.AdminDashboardTrail.Configuration",
      },
    ],
  },

  "Recruit.AdminDashboardWork.Configuration": {
    id: "Recruit.AdminDashboardWork.Configuration",
    gridContainer: { spacing: "14px", templateColumns: "minmax(0,1fr) 380px" },
    elements: [
      {
        id: "admin-queue",
        type: "component",
        componentType: "Recruit.Admin.DashboardQueue.Component",
      },
      {
        id: "admin-side",
        type: "component",
        componentType: "Recruit.Admin.DashboardSide.Component",
        access: { resource: "clients", action: ["read"] },
      },
    ],
  },

  "Recruit.AdminDashboardInsights.Configuration": {
    id: "Recruit.AdminDashboardInsights.Configuration",
    gridContainer: { spacing: "14px", templateColumns: "minmax(0,1fr) 380px" },
    elements: [
      {
        id: "admin-chart",
        type: "component",
        componentType: "Recruit.Admin.DashboardChart.Component",
        access: { resource: "revenue", action: ["view"] },
      },
      {
        id: "admin-quick-actions",
        type: "component",
        componentType: "Recruit.Admin.DashboardQuickActions.Component",
      },
    ],
  },

  "Recruit.AdminDashboardTrail.Configuration": {
    id: "Recruit.AdminDashboardTrail.Configuration",
    gridContainer: { spacing: "14px", templateColumns: "minmax(0,1fr) 380px" },
    elements: [
      {
        id: "admin-activity",
        type: "component",
        componentType: "Recruit.Admin.DashboardActivity.Component",
      },
      {
        id: "admin-recents",
        type: "component",
        componentType: "Recruit.Admin.DashboardRecents.Component",
        access: { resource: "candidates", action: ["read"] },
      },
    ],
  },

  "Recruit.AccountManagerDashboard.Configuration": {
    id: "Recruit.AccountManagerDashboard.Configuration",
    stackContainer: { spacing: 2.25 },
    elements: [
      {
        id: "account-manager-kpis",
        type: "component",
        componentType: "Recruit.AccountManager.DashboardStats.Component",
      },
      {
        id: "account-manager-status",
        type: "component",
        componentType: "Recruit.AccountManager.DashboardStatus.Component",
      },
      {
        id: "account-manager-today-work",
        type: "component",
        componentType: "Recruit.AccountManager.DashboardTodayWork.Component",
      },
      {
        id: "account-manager-work",
        type: "configuration",
        configurationId: "Recruit.AccountManagerDashboardWork.Configuration",
      },
      {
        id: "account-manager-insights",
        type: "configuration",
        configurationId: "Recruit.AccountManagerDashboardInsights.Configuration",
      },
      {
        id: "account-manager-ai",
        type: "component",
        componentType: "Recruit.AccountManager.DashboardAi.Component",
        access: { resource: "ai", action: ["use"] },
      },
      {
        id: "account-manager-trail",
        type: "configuration",
        configurationId: "Recruit.AccountManagerDashboardTrail.Configuration",
      },
    ],
  },

  "Recruit.AccountManagerDashboardWork.Configuration": {
    id: "Recruit.AccountManagerDashboardWork.Configuration",
    gridContainer: { spacing: "14px", templateColumns: "minmax(0,1fr) 380px" },
    elements: [
      {
        id: "account-manager-queue",
        type: "component",
        componentType: "Recruit.AccountManager.DashboardQueue.Component",
      },
      {
        id: "account-manager-side",
        type: "component",
        componentType: "Recruit.AccountManager.DashboardSide.Component",
        access: { resource: "clients", action: ["read"] },
      },
    ],
  },

  "Recruit.AccountManagerDashboardInsights.Configuration": {
    id: "Recruit.AccountManagerDashboardInsights.Configuration",
    gridContainer: { spacing: "14px", templateColumns: "minmax(0,1fr) 380px" },
    elements: [
      {
        id: "account-manager-chart",
        type: "component",
        componentType: "Recruit.AccountManager.DashboardChart.Component",
        access: { resource: "revenue", action: ["view"] },
      },
      {
        id: "account-manager-quick-actions",
        type: "component",
        componentType: "Recruit.AccountManager.DashboardQuickActions.Component",
      },
    ],
  },

  "Recruit.AccountManagerDashboardTrail.Configuration": {
    id: "Recruit.AccountManagerDashboardTrail.Configuration",
    gridContainer: { spacing: "14px", templateColumns: "minmax(0,1fr) 380px" },
    elements: [
      {
        id: "account-manager-activity",
        type: "component",
        componentType: "Recruit.AccountManager.DashboardActivity.Component",
      },
      {
        id: "account-manager-recents",
        type: "component",
        componentType: "Recruit.AccountManager.DashboardRecents.Component",
        access: { resource: "candidates", action: ["read"] },
      },
    ],
  },

  "Recruit.TeamLeadDashboard.Configuration": {
    id: "Recruit.TeamLeadDashboard.Configuration",
    stackContainer: { spacing: 2.25 },
    elements: [
      {
        id: "team-lead-kpis",
        type: "component",
        componentType: "Recruit.TeamLead.DashboardStats.Component",
      },
      {
        id: "team-lead-status",
        type: "component",
        componentType: "Recruit.TeamLead.DashboardStatus.Component",
      },
      {
        id: "team-lead-health",
        type: "configuration",
        configurationId: "Recruit.TeamLeadDashboardHealth.Configuration",
      },
      {
        id: "team-lead-today-work",
        type: "component",
        componentType: "Recruit.TeamLead.DashboardTodayWork.Component",
      },
      {
        id: "team-lead-work",
        type: "configuration",
        configurationId: "Recruit.TeamLeadDashboardWork.Configuration",
      },
      {
        id: "team-lead-insights",
        type: "configuration",
        configurationId: "Recruit.TeamLeadDashboardInsights.Configuration",
      },
      {
        id: "team-lead-ai",
        type: "component",
        componentType: "Recruit.TeamLead.DashboardAi.Component",
        access: { resource: "ai", action: ["use"] },
      },
      {
        id: "team-lead-trail",
        type: "configuration",
        configurationId: "Recruit.TeamLeadDashboardTrail.Configuration",
      },
    ],
  },

  "Recruit.TeamLeadDashboardHealth.Configuration": {
    id: "Recruit.TeamLeadDashboardHealth.Configuration",
    gridContainer: { spacing: "14px", templateColumns: "minmax(0,1fr) minmax(0,1.35fr)" },
    elements: [
      {
        id: "team-lead-team-health",
        type: "component",
        componentType: "Recruit.TeamLead.DashboardTeamHealth.Component",
        access: { resource: "members", action: ["view"] },
      },
      {
        id: "team-lead-coaching",
        type: "component",
        componentType: "Recruit.TeamLead.DashboardCoaching.Component",
        access: { resource: "members", action: ["view"] },
      },
    ],
  },

  "Recruit.TeamLeadDashboardWork.Configuration": {
    id: "Recruit.TeamLeadDashboardWork.Configuration",
    gridContainer: { spacing: "14px", templateColumns: "minmax(0,1fr) 380px" },
    elements: [
      {
        id: "team-lead-queue",
        type: "component",
        componentType: "Recruit.TeamLead.DashboardQueue.Component",
      },
      {
        id: "team-lead-side",
        type: "component",
        componentType: "Recruit.TeamLead.DashboardSide.Component",
        access: { resource: "clients", action: ["read"] },
      },
    ],
  },

  "Recruit.TeamLeadDashboardInsights.Configuration": {
    id: "Recruit.TeamLeadDashboardInsights.Configuration",
    gridContainer: { spacing: "14px", templateColumns: "minmax(0,1fr) 380px" },
    elements: [
      {
        id: "team-lead-chart",
        type: "component",
        componentType: "Recruit.TeamLead.DashboardChart.Component",
        access: { resource: "revenue", action: ["view"] },
      },
      {
        id: "team-lead-quick-actions",
        type: "component",
        componentType: "Recruit.TeamLead.DashboardQuickActions.Component",
      },
    ],
  },

  "Recruit.TeamLeadDashboardTrail.Configuration": {
    id: "Recruit.TeamLeadDashboardTrail.Configuration",
    gridContainer: { spacing: "14px", templateColumns: "minmax(0,1fr) 380px" },
    elements: [
      {
        id: "team-lead-activity",
        type: "component",
        componentType: "Recruit.TeamLead.DashboardActivity.Component",
      },
      {
        id: "team-lead-recents",
        type: "component",
        componentType: "Recruit.TeamLead.DashboardRecents.Component",
        access: { resource: "candidates", action: ["read"] },
      },
    ],
  },

  "Recruit.RecruiterDashboard.Configuration": {
    id: "Recruit.RecruiterDashboard.Configuration",
    stackContainer: { spacing: 2.25 },
    elements: [
      {
        id: "recruiter-kpis",
        type: "component",
        componentType: "Recruit.Recruiter.DashboardStats.Component",
      },
      {
        id: "recruiter-status",
        type: "component",
        componentType: "Recruit.Recruiter.DashboardStatus.Component",
      },
      {
        id: "recruiter-desk",
        type: "configuration",
        configurationId: "Recruit.RecruiterDashboardDesk.Configuration",
      },
      {
        id: "recruiter-today-work",
        type: "component",
        componentType: "Recruit.Recruiter.DashboardTodayWork.Component",
      },
      {
        id: "recruiter-work",
        type: "configuration",
        configurationId: "Recruit.RecruiterDashboardWork.Configuration",
      },
      {
        id: "recruiter-insights",
        type: "configuration",
        configurationId: "Recruit.RecruiterDashboardInsights.Configuration",
      },
      {
        id: "recruiter-ai",
        type: "component",
        componentType: "Recruit.Recruiter.DashboardAi.Component",
        access: { resource: "ai", action: ["use"] },
      },
      {
        id: "recruiter-trail",
        type: "configuration",
        configurationId: "Recruit.RecruiterDashboardTrail.Configuration",
      },
    ],
  },

  "Recruit.RecruiterDashboardWork.Configuration": {
    id: "Recruit.RecruiterDashboardWork.Configuration",
    gridContainer: { spacing: "14px", templateColumns: "minmax(0,1fr) 380px" },
    elements: [
      {
        id: "recruiter-queue",
        type: "component",
        componentType: "Recruit.Recruiter.DashboardQueue.Component",
      },
      {
        id: "recruiter-side",
        type: "component",
        componentType: "Recruit.Recruiter.DashboardSide.Component",
        access: { resource: "clients", action: ["read"] },
      },
    ],
  },

  "Recruit.RecruiterDashboardInsights.Configuration": {
    id: "Recruit.RecruiterDashboardInsights.Configuration",
    gridContainer: { spacing: "14px", templateColumns: "minmax(0,1fr) 380px" },
    elements: [
      {
        id: "recruiter-chart",
        type: "component",
        componentType: "Recruit.Recruiter.DashboardChart.Component",
        access: { resource: "revenue", action: ["view"] },
      },
      {
        id: "recruiter-quick-actions",
        type: "component",
        componentType: "Recruit.Recruiter.DashboardQuickActions.Component",
      },
    ],
  },

  "Recruit.RecruiterDashboardTrail.Configuration": {
    id: "Recruit.RecruiterDashboardTrail.Configuration",
    gridContainer: { spacing: "14px", templateColumns: "minmax(0,1fr) 380px" },
    elements: [
      {
        id: "recruiter-activity",
        type: "component",
        componentType: "Recruit.Recruiter.DashboardActivity.Component",
      },
      {
        id: "recruiter-recents",
        type: "component",
        componentType: "Recruit.Recruiter.DashboardRecents.Component",
        access: { resource: "candidates", action: ["read"] },
      },
    ],
  },

  "Recruit.RecruiterDashboardDesk.Configuration": {
    id: "Recruit.RecruiterDashboardDesk.Configuration",
    gridContainer: { spacing: "14px", templateColumns: "minmax(0,1.35fr) minmax(0,1fr)" },
    elements: [
      {
        id: "recruiter-my-pipeline",
        type: "component",
        componentType: "Recruit.Recruiter.DashboardMyPipeline.Component",
      },
      {
        id: "recruiter-week-goals",
        type: "component",
        componentType: "Recruit.Recruiter.DashboardWeekGoals.Component",
      },
    ],
  },

  "Recruit.SourcerDashboard.Configuration": {
    id: "Recruit.SourcerDashboard.Configuration",
    stackContainer: { spacing: 2.25 },
    elements: [
      {
        id: "sourcer-kpis",
        type: "component",
        componentType: "Recruit.Sourcer.DashboardStats.Component",
      },
      {
        id: "sourcer-status",
        type: "component",
        componentType: "Recruit.Sourcer.DashboardStatus.Component",
      },
      {
        id: "sourcer-desk",
        type: "configuration",
        configurationId: "Recruit.SourcerDashboardDesk.Configuration",
      },
      {
        id: "sourcer-saved-searches",
        type: "component",
        componentType: "Recruit.Sourcer.DashboardSavedSearches.Component",
        access: { resource: "candidates", action: ["read"] },
      },
      {
        id: "sourcer-today-work",
        type: "component",
        componentType: "Recruit.Sourcer.DashboardTodayWork.Component",
      },
      {
        id: "sourcer-work",
        type: "configuration",
        configurationId: "Recruit.SourcerDashboardWork.Configuration",
      },
      {
        id: "sourcer-insights",
        type: "configuration",
        configurationId: "Recruit.SourcerDashboardInsights.Configuration",
      },
      {
        id: "sourcer-ai",
        type: "component",
        componentType: "Recruit.Sourcer.DashboardAi.Component",
        access: { resource: "ai", action: ["use"] },
      },
      {
        id: "sourcer-trail",
        type: "configuration",
        configurationId: "Recruit.SourcerDashboardTrail.Configuration",
      },
    ],
  },

  "Recruit.SourcerDashboardWork.Configuration": {
    id: "Recruit.SourcerDashboardWork.Configuration",
    gridContainer: { spacing: "14px", templateColumns: "minmax(0,1fr) 380px" },
    elements: [
      {
        id: "sourcer-queue",
        type: "component",
        componentType: "Recruit.Sourcer.DashboardQueue.Component",
      },
      {
        id: "sourcer-side",
        type: "component",
        componentType: "Recruit.Sourcer.DashboardSide.Component",
        access: { resource: "clients", action: ["read"] },
      },
    ],
  },

  "Recruit.SourcerDashboardInsights.Configuration": {
    id: "Recruit.SourcerDashboardInsights.Configuration",
    gridContainer: { spacing: "14px", templateColumns: "minmax(0,1fr) 380px" },
    elements: [
      {
        id: "sourcer-chart",
        type: "component",
        componentType: "Recruit.Sourcer.DashboardChart.Component",
        access: { resource: "revenue", action: ["view"] },
      },
      {
        id: "sourcer-quick-actions",
        type: "component",
        componentType: "Recruit.Sourcer.DashboardQuickActions.Component",
      },
    ],
  },

  "Recruit.SourcerDashboardTrail.Configuration": {
    id: "Recruit.SourcerDashboardTrail.Configuration",
    gridContainer: { spacing: "14px", templateColumns: "minmax(0,1fr) 380px" },
    elements: [
      {
        id: "sourcer-activity",
        type: "component",
        componentType: "Recruit.Sourcer.DashboardActivity.Component",
      },
      {
        id: "sourcer-recents",
        type: "component",
        componentType: "Recruit.Sourcer.DashboardRecents.Component",
        access: { resource: "candidates", action: ["read"] },
      },
    ],
  },

  "Recruit.SourcerDashboardDesk.Configuration": {
    id: "Recruit.SourcerDashboardDesk.Configuration",
    gridContainer: { spacing: "14px", templateColumns: "minmax(0,1.35fr) minmax(0,1fr)" },
    elements: [
      {
        id: "sourcer-my-pipeline",
        type: "component",
        componentType: "Recruit.Sourcer.DashboardMyPipeline.Component",
      },
      {
        id: "sourcer-week-goals",
        type: "component",
        componentType: "Recruit.Sourcer.DashboardWeekGoals.Component",
      },
    ],
  },

  "Recruit.HiringManagerDashboard.Configuration": {
    id: "Recruit.HiringManagerDashboard.Configuration",
    stackContainer: { spacing: 2.25 },
    elements: [
      {
        id: "hiring-manager-kpis",
        type: "component",
        componentType: "Recruit.HiringManager.DashboardStats.Component",
      },
      {
        id: "hiring-manager-status",
        type: "component",
        componentType: "Recruit.HiringManager.DashboardStatus.Component",
      },
      {
        id: "hiring-manager-desk",
        type: "configuration",
        configurationId: "Recruit.HiringManagerDashboardDesk.Configuration",
      },
      {
        id: "hiring-manager-today-work",
        type: "component",
        componentType: "Recruit.HiringManager.DashboardTodayWork.Component",
      },
      {
        id: "hiring-manager-work",
        type: "configuration",
        configurationId: "Recruit.HiringManagerDashboardWork.Configuration",
      },
      {
        id: "hiring-manager-insights",
        type: "configuration",
        configurationId: "Recruit.HiringManagerDashboardInsights.Configuration",
      },
      {
        id: "hiring-manager-ai",
        type: "component",
        componentType: "Recruit.HiringManager.DashboardAi.Component",
        access: { resource: "ai", action: ["use"] },
      },
      {
        id: "hiring-manager-trail",
        type: "configuration",
        configurationId: "Recruit.HiringManagerDashboardTrail.Configuration",
      },
    ],
  },

  "Recruit.HiringManagerDashboardWork.Configuration": {
    id: "Recruit.HiringManagerDashboardWork.Configuration",
    gridContainer: { spacing: "14px", templateColumns: "minmax(0,1fr) 380px" },
    elements: [
      {
        id: "hiring-manager-queue",
        type: "component",
        componentType: "Recruit.HiringManager.DashboardQueue.Component",
      },
      {
        id: "hiring-manager-side",
        type: "component",
        componentType: "Recruit.HiringManager.DashboardSide.Component",
        access: { resource: "clients", action: ["read"] },
      },
    ],
  },

  "Recruit.HiringManagerDashboardInsights.Configuration": {
    id: "Recruit.HiringManagerDashboardInsights.Configuration",
    gridContainer: { spacing: "14px", templateColumns: "minmax(0,1fr) 380px" },
    elements: [
      {
        id: "hiring-manager-chart",
        type: "component",
        componentType: "Recruit.HiringManager.DashboardChart.Component",
        access: { resource: "revenue", action: ["view"] },
      },
      {
        id: "hiring-manager-quick-actions",
        type: "component",
        componentType: "Recruit.HiringManager.DashboardQuickActions.Component",
      },
    ],
  },

  "Recruit.HiringManagerDashboardTrail.Configuration": {
    id: "Recruit.HiringManagerDashboardTrail.Configuration",
    gridContainer: { spacing: "14px", templateColumns: "minmax(0,1fr) 380px" },
    elements: [
      {
        id: "hiring-manager-activity",
        type: "component",
        componentType: "Recruit.HiringManager.DashboardActivity.Component",
      },
      {
        id: "hiring-manager-recents",
        type: "component",
        componentType: "Recruit.HiringManager.DashboardRecents.Component",
        access: { resource: "candidates", action: ["read"] },
      },
    ],
  },

  "Recruit.HiringManagerDashboardDesk.Configuration": {
    id: "Recruit.HiringManagerDashboardDesk.Configuration",
    gridContainer: { spacing: "14px", templateColumns: "minmax(0,1.35fr) minmax(0,1fr)" },
    elements: [
      {
        id: "hiring-manager-my-pipeline",
        type: "component",
        componentType: "Recruit.HiringManager.DashboardMyPipeline.Component",
      },
      {
        id: "hiring-manager-week-goals",
        type: "component",
        componentType: "Recruit.HiringManager.DashboardWeekGoals.Component",
      },
    ],
  },

  "Recruit.ClientDashboard.Configuration": {
    id: "Recruit.ClientDashboard.Configuration",
    stackContainer: { spacing: 2.25 },
    elements: [
      {
        id: "client-kpis",
        type: "component",
        componentType: "Recruit.Client.DashboardStats.Component",
      },
      {
        id: "client-status",
        type: "component",
        componentType: "Recruit.Client.DashboardStatus.Component",
      },
      {
        id: "client-today-work",
        type: "component",
        componentType: "Recruit.Client.DashboardTodayWork.Component",
      },
      {
        id: "client-work",
        type: "configuration",
        configurationId: "Recruit.ClientDashboardWork.Configuration",
      },
      {
        id: "client-insights",
        type: "configuration",
        configurationId: "Recruit.ClientDashboardInsights.Configuration",
      },
      {
        id: "client-activity",
        type: "component",
        componentType: "Recruit.Client.DashboardActivity.Component",
      },
    ],
  },

  "Recruit.ClientDashboardWork.Configuration": {
    id: "Recruit.ClientDashboardWork.Configuration",
    gridContainer: { spacing: "14px", templateColumns: "minmax(0,1fr) 380px" },
    elements: [
      {
        id: "client-queue",
        type: "component",
        componentType: "Recruit.Client.DashboardQueue.Component",
      },
      {
        id: "client-side",
        type: "component",
        componentType: "Recruit.Client.DashboardSide.Component",
        access: { resource: "clients", action: ["read"] },
      },
    ],
  },

  "Recruit.ClientDashboardInsights.Configuration": {
    id: "Recruit.ClientDashboardInsights.Configuration",
    gridContainer: { spacing: "14px", templateColumns: "minmax(0,1fr) 380px" },
    elements: [
      {
        id: "client-chart",
        type: "component",
        componentType: "Recruit.Client.DashboardChart.Component",
        access: { resource: "revenue", action: ["view"] },
      },
      {
        id: "client-quick-actions",
        type: "component",
        componentType: "Recruit.Client.DashboardQuickActions.Component",
      },
    ],
  },
};
