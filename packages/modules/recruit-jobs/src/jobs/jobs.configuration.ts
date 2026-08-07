import type { TableFilterExportConfig } from "@recruit/shared";

const ID = "Recruit.Jobs.Component";

/**
 * The design's requisition table: the role over its meta line, the client over
 * its owner, the pipeline split as a composition bar, the fill as progress and
 * the clock the role runs against. The two-line cells come from `stack`, not
 * from bespoke markup — every value still goes through GenericRenderer.
 */
export const JobsConfiguration: TableFilterExportConfig = {
  columns: [
    {
      label: { name: "columns.role" },
      width: "28%",
      sort: { key: "title" },
      value: {
        type: "stack",
        items: [
          {
            value: {
              type: "stack",
              direction: "row",
              gap: "8px",
              items: [
                { value: { type: "string", path: "title", sx: { fontWeight: 700 } } },
                {
                  value: {
                    type: "status",
                    id: ID,
                    path: "status",
                    labels: {
                      open: "statuses.open",
                      on_hold: "statuses.on_hold",
                      filled: "statuses.filled",
                      closed: "statuses.closed",
                    },
                    colors: {
                      open: "success",
                      on_hold: "warning",
                      filled: "info",
                      closed: "default",
                    },
                  },
                },
              ],
            },
          },
          {
            value: {
              type: "stack",
              direction: "row",
              separator: "·",
              gap: "5px",
              items: [
                {
                  showPath: "reference",
                  value: {
                    type: "string",
                    path: "reference",
                    sx: { fontSize: 11.5, color: "text.disabled" },
                  },
                },
                {
                  showPath: "locationLabel",
                  value: {
                    type: "string",
                    path: "locationLabel",
                    sx: { fontSize: 11.5, color: "text.disabled" },
                  },
                },
                {
                  showPath: "employmentType",
                  value: {
                    type: "static-translation",
                    id: ID,
                    keyPath: "employmentType",
                    keyPrefix: "employmentTypes.",
                    sx: { fontSize: 11.5, color: "text.disabled" },
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      label: { name: "columns.client" },
      width: "17%",
      value: {
        type: "stack",
        items: [
          { value: { type: "string", path: "clientName", sx: { fontWeight: 600 } } },
          {
            showPath: "ownerName",
            value: {
              type: "string",
              path: "ownerName",
              sx: { fontSize: 11.5, color: "text.disabled" },
            },
          },
        ],
      },
    },
    {
      label: { name: "columns.pipeline" },
      width: "15%",
      value: {
        type: "stack",
        gap: "5px",
        items: [
          {
            value: {
              type: "segment-bar",
              segments: [
                { path: "pipelineEarly", color: "var(--mui-palette-surface-textDisabled)" },
                { path: "pipelineMid", color: "var(--mui-palette-surface-infoFg)" },
                { path: "pipelineLate", color: "var(--mui-palette-secondary-main)" },
              ],
            },
          },
          {
            value: {
              type: "static-translation",
              id: ID,
              key: "pipeline.inPlay",
              value: "pipeline",
              sx: { fontSize: 11.5, color: "text.disabled" },
            },
          },
        ],
      },
    },
    {
      label: { name: "columns.filled" },
      width: "15%",
      sort: { key: "openings" },
      value: {
        type: "stack",
        gap: "5px",
        items: [
          {
            value: {
              type: "segment-bar",
              segments: [{ path: "hires", color: "var(--mui-palette-primary-main)" }],
              totalPath: "openings",
              completeColor: "var(--mui-palette-surface-successFg)",
            },
          },
          {
            value: {
              type: "static-translation",
              id: ID,
              key: "filled.count",
              value: "hires",
              sx: { fontSize: 11.5, color: "text.disabled" },
            },
          },
        ],
      },
    },
    {
      label: { name: "columns.sla" },
      width: "15%",
      sort: { key: "targetDate" },
      value: {
        type: "stack",
        items: [
          {
            value: {
              type: "static-translation",
              id: ID,
              keyPath: "slaState",
              keyPrefix: "sla.",
              value: "slaDays",
              sx: { fontSize: 12.5, fontWeight: 700 },
              colors: {
                overdue: "var(--mui-palette-surface-errorFg)",
                due: "var(--mui-palette-surface-warningFg)",
                ok: "var(--mui-palette-surface-successFg)",
                none: "var(--mui-palette-surface-textDisabled)",
              },
            },
          },
          {
            value: {
              type: "static-translation",
              id: ID,
              key: "sla.opened",
              value: "ageDays",
              sx: { fontSize: 11.5, color: "text.disabled" },
            },
          },
        ],
      },
    },
  ],
  filters: [
    { type: "search", key: "search", placeholder: "filters.search" },
    {
      type: "segmented",
      key: "status",
      countsPath: "statusCounts",
      options: [
        { label: "statuses.all", value: "all" },
        { label: "statuses.open", value: "open" },
        { label: "statuses.on_hold", value: "on_hold" },
        { label: "statuses.filled", value: "filled" },
        { label: "statuses.closed", value: "closed" },
      ],
    },
    {
      type: "dropdown",
      key: "clientId",
      icon: "domain",
      label: { name: "filters.client" },
      optionSource: { url: "/clients", path: "data", valueKey: "id", labelKey: "name" },
    },
    { type: "toggle", key: "overdue", icon: "timer", label: { name: "filters.overdue" } },
  ],
  actions: [
    { type: "edit", icon: "edit", label: { name: "actions.edit" } },
    { type: "archive", icon: "archive", label: { name: "actions.archive" } },
  ],
  ctas: [{ label: { name: "actions.new" }, icon: "add", action: "add" }],
  export: { types: [{ label: "exportCsv", value: "csv", icon: "download" }] },
  pagination: { pageSize: 10 },
  emptyLabel: "empty",
  rowRouteId: "Recruit.JobDetail.Route",
};
