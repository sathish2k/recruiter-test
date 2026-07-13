import type { TableFilterExportConfig } from "@recruit/shared";

const STAGE_PILLS = {
  Sourced: {
    fg: "#C9C5BD",
    bg: "rgba(255,255,255,.07)",
    border: "rgba(255,255,255,.14)",
  },
  Screened: {
    fg: "#C9C5BD",
    bg: "rgba(255,255,255,.07)",
    border: "rgba(255,255,255,.14)",
  },
  Shortlisted: {
    fg: "#8FD6AC",
    bg: "rgba(78,168,116,.14)",
    border: "rgba(78,168,116,.35)",
  },
  Interviewing: {
    fg: "#F0B27C",
    bg: "rgba(242,106,27,.14)",
    border: "rgba(242,106,27,.35)",
  },
  Offer: {
    fg: "#8FD6AC",
    bg: "rgba(78,168,116,.14)",
    border: "rgba(78,168,116,.35)",
  },
  Rejected: {
    fg: "#E89A9A",
    bg: "rgba(200,80,80,.14)",
    border: "rgba(200,80,80,.35)",
  },
};

// Filter option VALUES are literal data (they match DB fields); labels are
// translation KEYS resolved by the renderer. Cells render via GenericRenderer.
export const CandidatesConfiguration: TableFilterExportConfig = {
  exportFilename: "candidates",
  filters: [
    { type: "search", key: "search", placeholder: "search" },
    {
      type: "multiselect",
      key: "stage",
      label: { name: "filters.stage" },
      options: [
        { value: "Sourced", label: "Sourced" },
        { value: "Screened", label: "Screened" },
        { value: "Shortlisted", label: "Shortlisted" },
        { value: "Interviewing", label: "Interviewing" },
        { value: "Offer", label: "Offer" },
        { value: "Rejected", label: "Rejected" },
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
      key: "source",
      label: { name: "filters.source" },
      options: [
        { value: "LinkedIn", label: "LinkedIn" },
        { value: "Referral", label: "Referral" },
        { value: "Indeed", label: "Indeed" },
        { value: "Careers page", label: "Careers page" },
      ],
    },
    {
      type: "multiselect",
      key: "exp",
      label: { name: "filters.exp" },
      options: [
        { value: "0–2 yrs", label: "0–2 yrs" },
        { value: "3–5 yrs", label: "3–5 yrs" },
        { value: "6–8 yrs", label: "6–8 yrs" },
        { value: "9+ yrs", label: "9+ yrs" },
      ],
    },
    {
      type: "multiselect",
      key: "match",
      label: { name: "filters.match" },
      options: [
        { value: "90%+", label: "90%+" },
        { value: "75–89%", label: "75–89%" },
        { value: "60–74%", label: "60–74%" },
        { value: "Below 60%", label: "Below 60%" },
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
  ctas: [
    {
      label: { name: "importCsv" },
      icon: "upload",
      action: "import",
      variant: "secondary",
    },
    { label: { name: "addCandidate" }, icon: "add", action: "add" },
  ],
  columns: [
    {
      label: { name: "columns.candidate" },
      value: {
        type: "entity",
        shape: "circle",
        bgPath: "avatarBg",
        fgPath: "avatarFg",
        textPath: "initials",
        title: "name",
        subtitle: "email",
      },
      sort: { key: "name" },
    },
    {
      label: { name: "columns.role" },
      value: { type: "string", path: "role", sx: { color: "#C9C5BD" } },
      sort: { key: "role" },
    },
    {
      label: { name: "columns.client" },
      value: { type: "string", path: "client", sx: { color: "#9A968E" } },
      sort: { key: "client" },
    },
    {
      label: { name: "columns.match" },
      value: {
        type: "ai-match",
        path: "match",
        suffix: "%",
        colorPath: "matchColor",
      },
      sort: { key: "match" },
    },
    {
      label: { name: "columns.exp" },
      value: { type: "string", path: "expLabel", sx: { color: "#C9C5BD" } },
      sort: { key: "exp" },
    },
    {
      label: { name: "columns.applied" },
      value: { type: "string", path: "applied", sx: { color: "#9A968E" } },
    },
    {
      label: { name: "columns.stage" },
      value: { type: "pill", path: "stage", styles: STAGE_PILLS },
      sort: { key: "stage" },
    },
    {
      label: { name: "columns.actions" },
      value: {
        type: "actions",
        actions: [{ icon: "event" }, { icon: "mail" }, { icon: "more" }],
      },
    },
  ],
  pagination: { pageSize: 10 },
};
