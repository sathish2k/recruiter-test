import type { WorkspaceTabConfig } from "@recruit/shared";

const ID = "Recruit.CandidateDetailWorkspace.Component";

/**
 * The design's tabbed panel. Applications carries one row per requirement the
 * candidate is on — one, until the application record lands (gap analysis,
 * step 8) — and the other two read the record's own files and audit trail.
 */
export const CandidateDetailWorkspaceConfiguration: WorkspaceTabConfig[] = [
  {
    value: "applications",
    label: { name: "tabs.applications" },
    title: { name: "workspace.applications" },
    viewAllRouteId: "Recruit.Jobs.Route",
    table: {
      columns: [
        {
          label: { name: "applications.columns.role" },
          value: { type: "entity", shape: "square", title: "role", subtitle: "clientName" },
        },
        {
          label: { name: "applications.columns.stage" },
          value: { type: "string", path: "stage" },
        },
        {
          label: { name: "applications.columns.match" },
          value: { type: "number", path: "matchScore", suffix: "%" },
        },
        { label: { name: "applications.columns.owner" }, value: { type: "string", path: "owner" } },
        {
          label: { name: "applications.columns.updated" },
          value: { type: "string", path: "updated" },
        },
      ],
      emptyState: {
        icon: "work",
        title: "applications.empty",
        description: "applications.emptyHint",
      },
    },
  },
  {
    value: "documents",
    label: { name: "tabs.documents" },
    title: { name: "workspace.documents" },
    table: {
      columns: [
        {
          label: { name: "documents.columns.name" },
          value: {
            type: "link",
            path: "url",
            textPath: "name",
            linkType: "external",
            target: "_blank",
          },
        },
        {
          label: { name: "documents.columns.slot" },
          value: {
            type: "status",
            id: ID,
            path: "slot",
            labels: {
              resume: "slots.resume",
              formattedResume: "slots.formattedResume",
              coverLetter: "slots.coverLetter",
              offer: "slots.offer",
              contracts: "slots.contracts",
              other: "slots.other",
            },
            colors: {
              resume: "primary",
              formattedResume: "success",
              coverLetter: "default",
              offer: "info",
              contracts: "info",
              other: "default",
            },
          },
        },
        {
          label: { name: "documents.columns.updated" },
          value: { type: "string", path: "updated" },
        },
      ],
      emptyState: {
        icon: "description",
        title: "documents.empty",
        description: "documents.emptyHint",
      },
    },
  },
  {
    value: "activity",
    label: { name: "tabs.activity" },
    title: { name: "workspace.activity" },
    list: {
      variant: "plain",
      headerGap: "12px",
      groupPath: "day",
      row: {
        keyPath: "id",
        leading: { type: "icon", path: "icon", size: 15 },
        title: { type: "text", path: "event" },
        description: { type: "text", path: "actor" },
      },
      emptyText: { name: "activity.empty" },
    },
  },
];
