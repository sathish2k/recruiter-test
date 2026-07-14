import type { TableFilterExportConfig } from "@recruit/shared";

const STATUS_PILLS = {
  Active: {
    fg: "#8FD6AC",
    bg: "rgba(78,168,116,.14)",
    border: "rgba(78,168,116,.35)",
  },
  Draft: {
    fg: "#F0C27C",
    bg: "rgba(214,155,60,.14)",
    border: "rgba(214,155,60,.35)",
  },
  Closed: {
    fg: "#C9C5BD",
    bg: "rgba(255,255,255,.07)",
    border: "rgba(255,255,255,.14)",
  },
};

// Filter option VALUES are literal data (they match DB fields); labels are
// translation KEYS resolved by the renderer. Cells render via GenericRenderer.
export const JobsConfiguration: TableFilterExportConfig = {
  exportFilename: "jobs",
  filters: [
    { type: "search", key: "search", placeholder: "search" },
    {
      type: "select",
      key: "role",
      label: { name: "filters.role" },
      options: [
        { value: "Engineering", label: "Engineering" },
        { value: "Design", label: "Design" },
        { value: "Data", label: "Data" },
        { value: "Product", label: "Product" },
      ],
    },
    {
      type: "select",
      key: "client",
      label: { name: "filters.client" },
      options: [
        { value: "Nortech", label: "Nortech" },
        { value: "Fablio", label: "Fablio" },
        { value: "Vantor", label: "Vantor" },
        { value: "Corely", label: "Corely" },
        { value: "Mistvale", label: "Mistvale" },
      ],
    },
    {
      type: "select",
      key: "status",
      label: { name: "filters.status" },
      options: [
        { value: "Active", label: "Active" },
        { value: "Draft", label: "Draft" },
        { value: "Closed", label: "Closed" },
      ],
    },
    {
      type: "select",
      key: "location",
      label: { name: "filters.location" },
      options: [
        { value: "Remote", label: "Remote" },
        { value: "NYC", label: "NYC" },
        { value: "SF", label: "SF" },
        { value: "Austin", label: "Austin" },
        { value: "Boston", label: "Boston" },
      ],
    },
    {
      type: "select",
      key: "empType",
      label: { name: "filters.empType" },
      options: [
        { value: "Full-time", label: "Full-time" },
        { value: "Contract", label: "Contract" },
        { value: "Part-time", label: "Part-time" },
      ],
    },
    {
      type: "select",
      key: "level",
      label: { name: "filters.level" },
      options: [
        { value: "Junior", label: "Junior" },
        { value: "Mid", label: "Mid" },
        { value: "Senior", label: "Senior" },
        { value: "Staff", label: "Staff" },
      ],
    },
  ],
  export: {
    types: [
      { label: "exportTypes.pdf", value: "pdf", icon: "pdf", color: "#E89A9A" },
      {
        label: "exportTypes.excel",
        value: "xlsx",
        icon: "excel",
        color: "#8FD6AC",
      },
      {
        label: "exportTypes.word",
        value: "docx",
        icon: "word",
        color: "#9BB8D9",
      },
    ],
  },
  ctas: [{ label: { name: "newJob" }, icon: "add", action: "add" }],
  columns: [
    {
      label: { name: "columns.role" },
      value: {
        type: "entity",
        shape: "square",
        bgPath: "logoBg",
        fgPath: "logoFg",
        textPath: "clientInitial",
        title: "title",
        subtitle: "openings",
      },
      sort: { key: "title" },
    },
    {
      label: { name: "columns.client" },
      value: { type: "string", path: "client", sx: { color: "#C9C5BD" } },
      sort: { key: "client" },
    },
    {
      label: { name: "columns.location" },
      value: { type: "string", path: "loc", sx: { color: "#9A968E" } },
      sort: { key: "location" },
    },
    {
      label: { name: "columns.pipeline" },
      value: { type: "string", path: "pipeline", sx: { fontWeight: 600 } },
      sort: { key: "pipeline" },
    },
    {
      label: { name: "columns.matched" },
      value: { type: "ai-match", path: "matched", color: "#FF9D57" },
      sort: { key: "matched" },
    },
    {
      label: { name: "columns.posted" },
      value: { type: "string", path: "posted", sx: { color: "#9A968E" } },
    },
    {
      label: { name: "columns.status" },
      value: { type: "pill", path: "status", styles: STATUS_PILLS },
      sort: { key: "status" },
    },
  ],
  // Trailing kebab (⋮) menu — a link item plus custom actions (actionHandler).
  actionsLabel: { name: "columns.actions" },
  actions: [
    {
      type: "link",
      icon: "view",
      label: { name: "actionsMenu.view" },
      routeId: "Recruit.Jobs.Route",
    },
    { type: "edit", icon: "edit", label: { name: "actionsMenu.edit" } },
    { type: "delete", icon: "delete", label: { name: "actionsMenu.delete" } },
  ],
  pagination: { pageSize: 5 },
};
