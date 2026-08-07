import type { TableFilterExportConfig } from "@recruit/shared";

const ID = "Recruit.Candidates.Component";

/**
 * The design's candidate table: the person over their "title · employer ·
 * notice" meta line, the role over its client, the pipeline stage as a chip,
 * the AI match as a score bar and the owner beside their initials. The
 * two-line cells come from `stack`, not from bespoke markup — every value
 * still goes through GenericRenderer.
 */
export const CandidatesConfiguration: TableFilterExportConfig = {
  columns: [
    {
      label: { name: "columns.candidate" },
      width: "30%",
      sort: { key: "name" },
      value: {
        type: "stack",
        direction: "row",
        gap: "12px",
        align: "center",
        items: [
          {
            value: {
              type: "entity",
              shape: "circle",
              size: 38,
              avatarOnly: true,
              title: "name",
              hashPath: "name",
            },
          },
          {
            value: {
              type: "stack",
              items: [
                { value: { type: "string", path: "name", sx: { fontWeight: 700 } } },
                {
                  value: {
                    type: "stack",
                    direction: "row",
                    separator: "·",
                    gap: "5px",
                    items: [
                      {
                        showPath: "currentJobTitle",
                        value: {
                          type: "string",
                          path: "currentJobTitle",
                          sx: { color: "text.secondary" },
                        },
                      },
                      {
                        showPath: "currentEmployer",
                        value: {
                          type: "string",
                          path: "currentEmployer",
                          sx: { color: "text.secondary" },
                        },
                      },
                      {
                        showPath: "noticePeriod",
                        value: {
                          type: "static-translation",
                          id: ID,
                          key: "meta.notice",
                          value: "noticePeriod",
                          sx: { color: "text.secondary" },
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      label: { name: "columns.role" },
      width: "22%",
      sort: { key: "role" },
      value: {
        type: "stack",
        items: [
          {
            showPath: "jobTitle",
            value: { type: "string", path: "jobTitle", sx: { color: "text.secondary" } },
          },
          {
            showPath: "clientName",
            value: { type: "string", path: "clientName", sx: { color: "text.disabled" } },
          },
        ],
      },
    },
    {
      label: { name: "columns.stage" },
      width: "13%",
      sort: { key: "stage" },
      value: {
        type: "status",
        id: ID,
        path: "stage",
        labels: {
          sourced: "stages.sourced",
          new: "stages.new",
          qualified: "stages.qualified",
          screening: "stages.screening",
          submitted: "stages.submitted",
          interview: "stages.interview",
          offer: "stages.offer",
          placed: "stages.placed",
          joined: "stages.joined",
          rejected: "stages.rejected",
        },
        // The design keeps the whole pipeline neutral and colours only the two
        // terminal outcomes — a stage is not a health signal.
        colors: {
          sourced: "default",
          new: "default",
          qualified: "default",
          screening: "default",
          submitted: "default",
          interview: "default",
          offer: "default",
          placed: "success",
          joined: "success",
          rejected: "error",
        },
      },
    },
    {
      label: { name: "columns.match" },
      width: "12%",
      sort: { key: "match" },
      value: { type: "score-bar", path: "matchScore", suffix: "%" },
    },
    {
      label: { name: "columns.owner" },
      width: "15%",
      sort: { key: "owner" },
      value: {
        type: "entity",
        shape: "circle",
        size: 26,
        title: "ownerName",
        hashPath: "ownerName",
      },
    },
  ],
  // The design's four dropdowns. Client, stage and owner are workspace data, so
  // they come from the same endpoints the forms select against rather than a
  // list that would drift; only `source` is a fixed vocabulary.
  filters: [
    {
      type: "segmented",
      key: "quick",
      countsPath: "quickCounts",
      options: [
        { label: "quick.all", value: "all" },
        { label: "quick.mine", value: "mine" },
        { label: "quick.pool", value: "pool" },
        { label: "quick.interviewing", value: "interviewing" },
        { label: "quick.offers", value: "offers" },
        { label: "quick.joined", value: "joined" },
        { label: "quick.rejected", value: "rejected" },
      ],
    },
    { type: "search", key: "search", placeholder: "filters.search" },
    {
      type: "select",
      key: "client",
      icon: "domain",
      label: { name: "filters.client" },
      optionSource: { url: "/clients", path: "data", valueKey: "name", labelKey: "name" },
    },
    {
      type: "select",
      key: "stage",
      icon: "kanban",
      label: { name: "filters.stage" },
      optionSource: { url: "/pipeline/stages", path: "data", valueKey: "name", labelKey: "name" },
    },
    {
      type: "select",
      key: "owner",
      icon: "person",
      label: { name: "filters.owner" },
      optionSource: { url: "/users", path: "data", valueKey: "name", labelKey: "name" },
    },
    {
      type: "select",
      key: "source",
      icon: "travel-explore",
      label: { name: "filters.source" },
      options: [
        { value: "added_by_user", label: "sources.added_by_user" },
        { value: "resume_upload", label: "sources.resume_upload" },
        { value: "csv_import", label: "sources.csv_import" },
        { value: "referral", label: "sources.referral" },
        { value: "inbound", label: "sources.inbound" },
        { value: "outbound", label: "sources.outbound" },
        { value: "event", label: "sources.event" },
      ],
    },
  ],
  actions: [
    { type: "edit", icon: "edit", label: { name: "actions.edit" } },
    { type: "archive", icon: "archive", label: { name: "actions.archive" } },
  ],
  ctas: [
    {
      label: { name: "actions.board" },
      icon: "kanban",
      variant: "secondary",
      routeId: "Recruit.CandidateBoard.Route",
    },
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
  rowRouteId: "Recruit.CandidateDetail.Route",
};
