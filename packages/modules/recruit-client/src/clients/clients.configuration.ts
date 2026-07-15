import type {
  ClientCardConfig,
  FilterConfig,
  JsonSchema,
  StatCardRendererConfig,
} from "@recruit/shared";

// Filter + stats structure. Labels/placeholders are translation KEYS resolved
// by the component (via useTranslation); counts are injected at runtime.
export const ClientsConfiguration: {
  filters: FilterConfig[];
  stats: StatCardRendererConfig[];
  card: ClientCardConfig;
  addForm: JsonSchema;
} = {
  addForm: {
    type: "object",
    properties: {
      name: {
        type: "string",
        title: "addForm.name",
        placeholder: "addForm.namePlaceholder",
      },
      industry: {
        type: "string",
        title: "addForm.industry",
        placeholder: "addForm.industryPlaceholder",
      },
      manager: {
        type: "string",
        title: "addForm.manager",
        placeholder: "addForm.managerPlaceholder",
        enum: ["Riya Kapoor", "Dev Shah", "Ana Novak"],
      },
    },
    required: ["name"],
  },
  card: {
    name: {
      type: "string",
      path: "name",
      sx: { fontSize: 15.5, fontWeight: 700 },
    },
    status: {
      type: "status",
      path: "status",
      labels: { hiring: "status.hiring", paused: "status.paused" },
      colors: { hiring: "success", paused: "default" },
      dot: true,
      sx: {
        fontSize: 11.5,
        fontWeight: 600,
        height: 24,
        "& .MuiChip-label": { px: "11px" },
      },
    },
    metrics: [
      {
        label: { name: "openRoles" },
        value: { type: "number", path: "openRoles" },
      },
      {
        label: { name: "inPipeline" },
        value: { type: "number", path: "pipeline" },
      },
      {
        label: { name: "hires" },
        value: { type: "number", path: "hires", sx: { color: "#FF9D57" } },
      },
    ],
    pipeline: [
      {
        type: "static-translation",
        key: "sourced",
        value: "sourced",
        swatch: "#3A3A38",
        sx: { fontSize: 11.5 },
      },
      {
        type: "static-translation",
        key: "screened",
        value: "screened",
        swatch: "#B9805A",
        sx: { fontSize: 11.5 },
      },
      {
        type: "static-translation",
        key: "interviewing",
        value: "interviewing",
        swatch: "#F26A1B",
        sx: { fontSize: 11.5 },
      },
    ],
    // ponytail: no client-detail screen exists yet, so the card exposes no
    // "View details" action. Add an actions entry (routeId +
    // Recruit.ClientDetail.Route) once that screen is built.
    actions: [],
  },
  filters: [
    { type: "search", key: "search", placeholder: "search" },
    {
      type: "segmented",
      key: "status",
      options: [
        { value: "all", label: "filters.all" },
        { value: "hiring", label: "filters.hiring" },
        { value: "paused", label: "filters.paused" },
      ],
    },
  ],
  stats: [
    {
      label: { name: "summary.activeClients" },
      value: { type: "number", path: "active" },
      delta: { name: "summary.activeDelta" },
    },
    {
      label: { name: "summary.openRoles" },
      value: { type: "number", path: "openRoles" },
      delta: { name: "summary.openRolesDelta", value: "openRoleClients" },
    },
    {
      label: { name: "summary.avgTimeToHire" },
      value: { type: "number", path: "avgTimeToHire", suffix: " days" },
      delta: { name: "summary.avgTimeDelta", color: "#8FD6AC" },
    },
    {
      label: { name: "summary.placements" },
      value: { type: "number", path: "placements" },
      delta: { name: "summary.placementsDelta" },
    },
  ],
};
