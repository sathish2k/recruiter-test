import type { WorkspaceTabConfig } from "@recruit/shared";

const ID = "Recruit.ContactDetailWorkspace.Component";

/** The design's five tabs. Activity and Notes read as lists; the rest are
 * tables — one endpoint, the tab travels as a filter. */
export const ContactDetailWorkspaceConfiguration: WorkspaceTabConfig[] = [
  {
    value: "activity",
    label: { name: "tabs.activity" },
    title: { name: "workspace.activity" },
    list: {
      variant: "plain",
      headerGap: "12px",
      filterParam: "activity",
      filters: {
        param: "activity",
        variant: "chips",
        options: [
          { label: "activity.filters.all", value: "all" },
          { label: "activity.filters.email", value: "email" },
          { label: "activity.filters.submissions", value: "submissions" },
          { label: "activity.filters.meetings", value: "meetings" },
        ],
      },
      groupPath: "day",
      groupLabelPrefix: "activity.days.",
      row: {
        keyPath: "id",
        leading: { type: "icon", path: "icon", colorPath: "iconColor", size: 15 },
        title: { type: "text", path: "event", highlightPath: "subject" },
        description: { type: "text", path: "when" },
      },
      emptyText: { name: "activity.empty" },
    },
  },
  {
    value: "roles",
    label: { name: "tabs.roles" },
    title: { name: "workspace.roles" },
    viewAllRouteId: "Recruit.Jobs.Route",
    table: {
      columns: [
        {
          label: { name: "roles.columns.title" },
          value: { type: "entity", shape: "square", title: "title", subtitle: "meta" },
        },
        {
          label: { name: "roles.columns.herRole" },
          value: {
            type: "status",
            id: ID,
            path: "herRole",
            labels: { primary: "herRole.primary", named: "herRole.named" },
            colors: { primary: "primary", named: "default" },
          },
        },
        { label: { name: "roles.columns.pipeline" }, value: { type: "number", path: "pipeline" } },
        {
          label: { name: "roles.columns.submitted" },
          value: { type: "number", path: "submitted" },
        },
        {
          label: { name: "roles.columns.status" },
          value: {
            type: "status",
            id: ID,
            path: "status",
            labels: {
              open: "jobStatus.open",
              on_hold: "jobStatus.on_hold",
              closed: "jobStatus.closed",
              filled: "jobStatus.filled",
            },
            colors: { open: "success", on_hold: "warning", closed: "default", filled: "info" },
          },
        },
      ],
      emptyState: { icon: "work", title: "roles.empty", description: "roles.emptyHint" },
    },
  },
  {
    value: "candidates",
    label: { name: "tabs.candidates" },
    title: { name: "workspace.candidates" },
    viewAllRouteId: "Recruit.Candidates.Route",
    table: {
      columns: [
        {
          label: { name: "candidates.columns.name" },
          value: { type: "entity", shape: "circle", hashPath: "name", title: "name" },
        },
        { label: { name: "candidates.columns.role" }, value: { type: "text", path: "role" } },
        {
          label: { name: "candidates.columns.stage" },
          value: {
            type: "status",
            id: ID,
            path: "stage",
            labels: {
              sourced: "stage.sourced",
              screening: "stage.screening",
              submitted: "stage.submitted",
              interview: "stage.interview",
              offer: "stage.offer",
              placed: "stage.placed",
            },
            colors: {
              sourced: "default",
              screening: "info",
              submitted: "warning",
              interview: "primary",
              offer: "primary",
              placed: "success",
            },
          },
        },
        {
          label: { name: "candidates.columns.match" },
          value: { type: "ai-match", path: "matchScore", suffix: "%" },
        },
        { label: { name: "candidates.columns.updated" }, value: { type: "text", path: "updated" } },
      ],
      emptyState: { icon: "group", title: "candidates.empty", description: "candidates.emptyHint" },
    },
  },
  {
    value: "interviews",
    label: { name: "tabs.interviews" },
    title: { name: "workspace.interviews" },
    viewAllRouteId: "Recruit.Interviews.Route",
    table: {
      columns: [
        {
          label: { name: "interviews.columns.name" },
          value: { type: "entity", shape: "circle", hashPath: "name", title: "name" },
        },
        { label: { name: "interviews.columns.role" }, value: { type: "text", path: "role" } },
        {
          label: { name: "interviews.columns.when" },
          value: {
            type: "date",
            path: "scheduledAt",
            options: { weekday: "short", hour: "numeric", minute: "2-digit" },
          },
        },
        { label: { name: "interviews.columns.panel" }, value: { type: "text", path: "panel" } },
        {
          label: { name: "interviews.columns.status" },
          value: {
            type: "status",
            id: ID,
            path: "status",
            labels: {
              scheduled: "interviewStatus.scheduled",
              completed: "interviewStatus.completed",
              cancelled: "interviewStatus.cancelled",
              no_show: "interviewStatus.no_show",
            },
            colors: {
              scheduled: "success",
              completed: "info",
              cancelled: "default",
              no_show: "error",
            },
          },
        },
      ],
      emptyState: { icon: "event", title: "interviews.empty", description: "interviews.emptyHint" },
    },
  },
  {
    value: "notes",
    label: { name: "tabs.notes" },
    title: { name: "workspace.notes" },
    list: {
      variant: "inset",
      headerGap: "12px",
      row: {
        keyPath: "id",
        leading: {
          type: "entity",
          shape: "circle",
          size: 26,
          avatarOnly: true,
          hashPath: "author",
          title: "author",
        },
        title: { type: "text", path: "author" },
        chips: { type: "text", path: "when" },
        description: { type: "text", path: "body" },
      },
      emptyText: { name: "notes.empty" },
    },
  },
];
