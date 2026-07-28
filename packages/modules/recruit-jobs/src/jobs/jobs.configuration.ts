import type { TableFilterExportConfig } from "@recruit/shared";

export const JobsConfiguration: TableFilterExportConfig = {
  columns: [
    {
      label: { name: "columns.reference" },
      width: "12%",
      value: { type: "string", path: "reference", sx: { color: "text.secondary" } },
    },
    {
      label: { name: "columns.title" },
      width: "26%",
      sort: { key: "title" },
      value: { type: "string", path: "title", sx: { fontWeight: 600 } },
    },
    {
      label: { name: "columns.client" },
      width: "20%",
      value: { type: "string", path: "clientName", sx: { color: "text.secondary" } },
    },
    { label: { name: "columns.status" }, width: "12%", value: { type: "string", path: "status" } },
    {
      label: { name: "columns.openings" },
      width: "12%",
      align: "center",
      value: { type: "string", path: "openings" },
    },
    {
      label: { name: "columns.updated" },
      width: "14%",
      value: { type: "date", path: "updatedAt" },
    },
  ],
  filters: [{ type: "search", key: "search", placeholder: "filters.search" }],
  actions: [
    { type: "edit", icon: "edit", label: { name: "actions.edit" } },
    { type: "archive", icon: "archive", label: { name: "actions.archive" } },
  ],
  ctas: [{ label: { name: "actions.new" }, icon: "add", action: "add" }],
  export: { types: [{ label: "exportCsv", value: "csv", icon: "download" }] },
  pagination: { pageSize: 10 },
  emptyLabel: "empty",
  rowRouteId: "Recruit.JobEdit.Route",
};
