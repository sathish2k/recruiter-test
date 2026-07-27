import type { TableFilterExportConfig } from "@recruit/shared";

/** Card-grid specifics; the toolbar, filters and paging come from `table`. */
export interface ClientsConfiguration {
  newRouteId: string;
  editRouteId: string;
  detailRouteId: string;
  addRoleRouteId: string;
  contactsRouteId: string;
  /** Minimum card width before the grid wraps (design: 300px). */
  cardMinWidth: number;
  /**
   * Drives TableFilterExportRenderer: the search + status tabs + health filter
   * row, the export menu, the Add-client CTA and the pager — the same toolbar
   * the table screens use. `columns` is empty because the body is cards.
   */
  table: TableFilterExportConfig;
}

export const ClientsConfiguration: ClientsConfiguration = {
  newRouteId: "Recruit.ClientNew.Route",
  editRouteId: "Recruit.ClientEdit.Route",
  detailRouteId: "Recruit.ClientDetail.Route",
  addRoleRouteId: "Recruit.Jobs.Route",
  contactsRouteId: "Recruit.Contacts.Route",
  cardMinWidth: 300,
  table: {
    columns: [],
    pagination: { pageSize: 6 },
    filters: [
      { key: "search", type: "search", placeholder: "searchPlaceholder", width: 360 },
      {
        key: "status",
        type: "segmented",
        options: [
          { label: "tabs.all", value: "" },
          { label: "tabs.hiring", value: "hiring" },
          { label: "tabs.paused", value: "paused" },
        ],
      },
      {
        key: "health",
        type: "dropdown",
        label: { name: "filters.health" },
        options: [
          { label: "health.healthy", value: "healthy" },
          { label: "health.attention", value: "attention" },
          { label: "health.at_risk", value: "at_risk" },
          { label: "health.dormant", value: "dormant" },
        ],
      },
    ],
    export: {
      types: [
        { label: "exportTypes.pdf", value: "pdf", icon: "pdf" },
        { label: "exportTypes.xlsx", value: "xlsx", icon: "excel" },
        { label: "exportTypes.docx", value: "docx", icon: "word" },
      ],
    },
    exportFilename: "clients",
    ctas: [
      { label: { name: "addClient" }, routeId: "Recruit.ClientNew.Route", variant: "primary" },
    ],
    emptyLabel: "empty",
  },
};
