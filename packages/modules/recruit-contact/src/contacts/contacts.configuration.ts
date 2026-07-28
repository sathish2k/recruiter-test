import type { TableFilterExportConfig } from "@recruit/shared";

/** Email/phone/owner use built-in GenericRenderer types (`copy`, `entity`);
 * only the contact (multi-chip) and client (soft chip) columns need custom
 * cells supplied via the component's `cells` prop. */
export const ContactsConfiguration: TableFilterExportConfig = {
  variant: "list",
  selectable: true,
  bulkActions: [
    { type: "bulkEmail", icon: "mail", label: { name: "bulk.email" } },
    { type: "bulkOwner", icon: "person", label: { name: "bulk.owner" } },
    { type: "bulkStatus", icon: "flag", label: { name: "bulk.status" } },
    { type: "bulkExport", icon: "download", label: { name: "bulk.export" } },
  ],
  emptyActions: [{ type: "add", icon: "person-add", label: { name: "actions.new" } }],
  columns: [
    {
      label: { name: "columns.contact" },
      width: "25%",
      sort: { key: "name" },
      value: { type: "contactCell" },
    },
    { label: { name: "columns.client" }, width: "12%", value: { type: "clientCell" } },
    {
      label: { name: "columns.email" },
      width: "17%",
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
      width: "13%",
      value: {
        type: "string",
        path: "phone",
        copyable: true,
        copiedLabel: "toast.copied",
        sx: { color: "text.secondary", whiteSpace: "nowrap" },
      },
    },
    {
      label: { name: "columns.lastTouch" },
      width: "13%",
      sort: { key: "updatedAt" },
      value: { type: "text", path: "lastTouch", colorPath: "lastTouchColor" },
    },
    {
      label: { name: "columns.owner" },
      width: "4%",
      value: {
        type: "entity",
        shape: "circle",
        size: 24,
        avatarOnly: true,
        title: "ownerName",
        hashPath: "ownerName",
      },
    },
    {
      label: { name: "columns.reach" },
      width: "8%",
      value: {
        type: "actions",
        actions: [
          { icon: "link", href: "{linkedin}" },
          { icon: "mail", href: "mailto:{email}" },
          { icon: "call", href: "tel:{phone}" },
        ],
      },
    },
  ],
  filters: [
    { type: "search", key: "search", placeholder: "filters.search" },
    {
      type: "select",
      key: "client",
      icon: "domain",
      label: { name: "filters.client" },
      optionSource: { url: "/clients", path: "data", valueKey: "id", labelKey: "name" },
    },
    {
      type: "select",
      key: "owner",
      icon: "person",
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
    types: [
      { label: "exportTypes.pdf", value: "pdf", icon: "pdf" },
      { label: "exportTypes.xlsx", value: "xlsx", icon: "excel" },
      { label: "exportTypes.docx", value: "docx", icon: "word" },
    ],
  },
  exportFilename: "contacts",
  pagination: { pageSize: 10 },
  emptyLabel: "empty",
  rowRouteId: "Recruit.ContactDetail.Route",
};
