import type { TableFilterExportConfig } from "@recruit/shared";

/** Email/phone/owner use built-in GenericRenderer types (`copy`, `entity`);
 * only the contact (multi-chip) and client (soft chip) columns need custom
 * cells supplied via the component's `cells` prop. */
export const ContactsConfiguration: TableFilterExportConfig = {
  columns: [
    {
      label: { name: "columns.contact" },
      width: "30%",
      sort: { key: "name" },
      value: { type: "contactCell" },
    },
    { label: { name: "columns.client" }, width: "16%", value: { type: "clientCell" } },
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
      label: { name: "columns.phone" },
      width: "16%",
      value: {
        type: "string",
        path: "phone",
        copyable: true,
        copiedLabel: "toast.copied",
        sx: { color: "text.secondary" },
      },
    },
    {
      label: { name: "columns.owner" },
      width: "16%",
      value: {
        type: "entity",
        shape: "circle",
        size: 24,
        title: "ownerName",
        hashPath: "ownerName",
      },
    },
  ],
  filters: [
    { type: "search", key: "search", placeholder: "filters.search" },
    {
      type: "select",
      key: "client",
      label: { name: "filters.client" },
      optionSource: { url: "/clients", path: "data", valueKey: "id", labelKey: "name" },
    },
    {
      type: "select",
      key: "owner",
      label: { name: "filters.owner" },
      optionSource: { url: "/users", path: "data", valueKey: "id", labelKey: "name" },
    },
  ],
  actions: [
    { type: "view", icon: "visibility", label: { name: "actions.view" } },
    { type: "edit", icon: "edit", label: { name: "actions.edit" } },
    {
      type: "setPrimary",
      icon: "star",
      label: { name: "actions.setPrimary" },
      hideWhen: "isPrimary",
    },
    { type: "archive", icon: "archive", label: { name: "actions.archive" } },
  ],
  ctas: [{ label: { name: "actions.new" }, icon: "person-add", action: "add" }],
  export: {
    types: [{ label: "exportCsv", value: "csv", icon: "download" }],
  },
  pagination: { pageSize: 10 },
  emptyLabel: "empty",
  rowRouteId: "Recruit.ContactEdit.Route",
};
