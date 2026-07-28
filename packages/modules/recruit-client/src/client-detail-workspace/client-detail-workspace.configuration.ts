import type { TableRendererConfig } from "@recruit/shared";

const ID = "Recruit.ClientDetailWorkspace.Component";

/** One tab of the workspace panel — its title, table and data path. */
export interface WorkspaceTabConfig {
  value: string;
  label: { name: string };
  title: { name: string };
  table: TableRendererConfig;
  viewAllRouteId?: string;
}

export const ClientDetailWorkspaceConfiguration: WorkspaceTabConfig[] = [
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
          label: { name: "roles.columns.contact" },
          value: {
            type: "entity",
            shape: "circle",
            hashPath: "contactName",
            title: "contactName",
          },
        },
        {
          label: { name: "roles.columns.profileLead" },
          value: {
            type: "entity",
            shape: "circle",
            hashPath: "profileLeadName",
            title: "profileLeadName",
          },
        },
        {
          label: { name: "roles.columns.pipeline" },
          value: { type: "number", path: "pipeline" },
        },
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
              filled: "jobStatus.filled",
              closed: "jobStatus.closed",
            },
            colors: { open: "success", on_hold: "warning", filled: "info", closed: "default" },
          },
        },
      ],
      rowRouteId: "Recruit.JobEdit.Route",
      emptyLabel: "roles.empty",
    },
  },
  {
    value: "interviews",
    label: { name: "tabs.interviews" },
    title: { name: "workspace.interviews" },
    table: {
      columns: [
        {
          label: { name: "interviews.columns.candidate" },
          value: { type: "entity", shape: "circle", hashPath: "name", title: "name" },
        },
        { label: { name: "interviews.columns.role" }, value: { type: "text", path: "role" } },
        {
          label: { name: "interviews.columns.when" },
          value: {
            type: "date",
            path: "scheduledAt",
            options: { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" },
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
            },
            colors: { scheduled: "success", completed: "info", cancelled: "default" },
          },
        },
      ],
      emptyLabel: "interviews.empty",
    },
  },
  {
    value: "placements",
    label: { name: "tabs.placements" },
    title: { name: "workspace.placements" },
    table: {
      columns: [
        {
          label: { name: "placements.columns.candidate" },
          value: { type: "entity", shape: "circle", hashPath: "name", title: "name" },
        },
        { label: { name: "placements.columns.role" }, value: { type: "text", path: "role" } },
        {
          label: { name: "placements.columns.joined" },
          value: {
            type: "date",
            path: "joinedAt",
            options: { day: "numeric", month: "short", year: "numeric" },
          },
        },
        {
          label: { name: "placements.columns.guarantee" },
          value: { type: "text", path: "guarantee" },
        },
      ],
      emptyLabel: "placements.empty",
    },
  },
  {
    value: "invoices",
    label: { name: "tabs.invoices" },
    title: { name: "workspace.invoices" },
    table: {
      columns: [
        {
          label: { name: "invoices.columns.number" },
          value: { type: "entity", shape: "square", title: "number", subtitle: "description" },
        },
        {
          label: { name: "invoices.columns.amount" },
          value: { type: "currency", path: "amount", currency: "INR", compact: true },
        },
        {
          label: { name: "invoices.columns.issued" },
          value: {
            type: "date",
            path: "issuedAt",
            options: { day: "numeric", month: "short", year: "numeric" },
          },
        },
        {
          label: { name: "invoices.columns.status" },
          value: {
            type: "status",
            id: ID,
            path: "status",
            labels: {
              paid: "invoiceStatus.paid",
              due: "invoiceStatus.due",
              overdue: "invoiceStatus.overdue",
            },
            colors: { paid: "success", due: "info", overdue: "error" },
          },
        },
      ],
      emptyLabel: "invoices.empty",
    },
  },
];
