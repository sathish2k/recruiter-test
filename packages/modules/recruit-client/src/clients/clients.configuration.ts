export interface ClientsConfiguration {
  /** Status pill-tabs above the grid. `value: "all"` clears the status filter. */
  tabs: { value: string; label: string }[];
  pageSize: number;
  statsComponentId: string;
  newRouteId: string;
  editRouteId: string;
  detailRouteId: string;
  addRoleRouteId: string;
  contactsRouteId: string;
}

export const ClientsConfiguration: ClientsConfiguration = {
  tabs: [
    { value: "all", label: "tabs.all" },
    { value: "hiring", label: "tabs.hiring" },
    { value: "paused", label: "tabs.paused" },
  ],
  pageSize: 6,
  statsComponentId: "Recruit.ClientStats.Component",
  newRouteId: "Recruit.ClientNew.Route",
  editRouteId: "Recruit.ClientEdit.Route",
  detailRouteId: "Recruit.ClientDetail.Route",
  addRoleRouteId: "Recruit.Jobs.Route",
  contactsRouteId: "Recruit.Contacts.Route",
};
