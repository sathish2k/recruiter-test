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
      type: "multiselect",
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
      type: "multiselect",
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
      type: "multiselect",
      key: "status",
      label: { name: "filters.status" },
      options: [
        { value: "Active", label: "Active" },
        { value: "Draft", label: "Draft" },
        { value: "Closed", label: "Closed" },
      ],
    },
    {
      type: "multiselect",
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
      type: "multiselect",
      key: "empType",
      label: { name: "filters.empType" },
      options: [
        { value: "Full-time", label: "Full-time" },
        { value: "Contract", label: "Contract" },
        { value: "Part-time", label: "Part-time" },
      ],
    },
    {
      type: "multiselect",
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
      { label: "exportTypes.pdf", value: "pdf", icon: "pdf" },
      { label: "exportTypes.excel", value: "xlsx", icon: "excel" },
      { label: "exportTypes.word", value: "docx", icon: "word" },
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
  pagination: { pageSize: 5 },
};
