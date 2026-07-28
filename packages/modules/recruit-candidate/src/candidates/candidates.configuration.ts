import type { TableFilterExportConfig } from "@recruit/shared";

export const CandidatesConfiguration: TableFilterExportConfig = {
  columns: [
    {
      label: { name: "columns.name" },
      width: "26%",
      sort: { key: "name" },
      value: {
        type: "entity",
        shape: "circle",
        size: 26,
        title: "name",
        subtitle: "currentJobTitle",
        hashPath: "name",
      },
    },
    {
      label: { name: "columns.email" },
      width: "22%",
      value: {
        type: "string",
        path: "email",
        copyable: true,
        copiedLabel: "toast.copied",
        sx: { color: "text.secondary" },
      },
    },
    {
      label: { name: "columns.job" },
      width: "20%",
      value: { type: "string", path: "jobTitle", sx: { color: "text.secondary" } },
    },
    {
      label: { name: "columns.availability" },
      width: "13%",
      value: {
        type: "status",
        id: "Recruit.Candidates.Component",
        path: "availability",
        labels: {
          actively_looking: "availabilities.actively_looking",
          open_to_offers: "availabilities.open_to_offers",
          not_looking: "availabilities.not_looking",
          placed: "availabilities.placed",
        },
        colors: {
          actively_looking: "success",
          open_to_offers: "info",
          not_looking: "default",
          placed: "primary",
        },
      },
    },
    { label: { name: "columns.status" }, width: "10%", value: { type: "string", path: "status" } },
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
  ctas: [
    {
      label: { name: "actions.import" },
      icon: "upload-file",
      variant: "secondary",
      routeId: "Recruit.CandidateImport.Route",
    },
    { label: { name: "actions.new" }, icon: "person-add", action: "add" },
  ],
  export: { types: [{ label: "exportCsv", value: "csv", icon: "download" }] },
  pagination: { pageSize: 10 },
  emptyLabel: "empty",
  rowRouteId: "Recruit.CandidateEdit.Route",
};
