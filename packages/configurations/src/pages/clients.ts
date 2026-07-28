import type { Configuration } from "@recruit/sdk";

export const ClientPages: Record<string, Configuration> = {
  "Recruit.Clients.Page": {
    id: "Recruit.Clients.Page",
    stackContainer: { spacing: 2.5 },
    elements: [
      {
        id: "client-stats",
        type: "component",
        componentType: "Recruit.ClientStats.Component",
      },
      { id: "clients", type: "component", componentType: "Recruit.Clients.Component" },
    ],
  },
  "Recruit.ClientForm.Page": {
    id: "Recruit.ClientForm.Page",
    elements: [
      { id: "client-form", type: "component", componentType: "Recruit.ClientForm.Component" },
    ],
  },
  /**
   * Main column + rail, laid out the way the dashboard is: the layout pads the
   * content region, so the columns cancel that on their shared edge and re-apply
   * the design`s gutters around the dividing hairline.
   */
  "Recruit.ClientDetail.Page": {
    id: "Recruit.ClientDetail.Page",
    gridContainer: { spacing: 0 },
    elements: [
      {
        id: "client-detail-main",
        type: "configuration",
        configurationId: "Recruit.ClientDetailMain.Configuration",
        gridItem: { size: { xs: 12, lg: 8 } },
        sx: {
          pr: { lg: "26px" },
          borderRight: { lg: "1px solid" },
          borderColor: { lg: "divider" },
        },
      },
      {
        id: "client-detail-rail",
        type: "configuration",
        configurationId: "Recruit.ClientDetailRail.Configuration",
        gridItem: { size: { xs: 12, lg: 4 } },
        sx: { pl: { lg: "22px" }, pt: { xs: "20px", lg: 0 } },
      },
    ],
  },

  "Recruit.ClientDetailMain.Configuration": {
    id: "Recruit.ClientDetailMain.Configuration",
    stackContainer: { spacing: 2.5 },
    elements: [
      {
        id: "client-detail-header",
        type: "component",
        componentType: "Recruit.ClientDetailHeader.Component",
      },
      {
        id: "client-detail-stats",
        type: "component",
        componentType: "Recruit.ClientDetailStats.Component",
      },
      {
        id: "client-detail-submissions",
        type: "component",
        componentType: "Recruit.ClientDetailSubmissions.Component",
      },
      {
        id: "client-detail-workspace",
        type: "component",
        componentType: "Recruit.ClientDetailWorkspace.Component",
      },
    ],
  },

  "Recruit.ClientDetailRail.Configuration": {
    id: "Recruit.ClientDetailRail.Configuration",
    stackContainer: { spacing: 2 },
    elements: [
      {
        id: "client-detail-contacts",
        type: "component",
        componentType: "Recruit.ClientDetailContacts.Component",
      },
      {
        id: "client-detail-agreement",
        type: "component",
        componentType: "Recruit.ClientDetailAgreement.Component",
      },
      {
        id: "client-detail-activity",
        type: "component",
        componentType: "Recruit.ClientDetailActivity.Component",
      },
    ],
  },
};
