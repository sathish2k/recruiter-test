import type { Configuration } from "@recruit/sdk";

export const ContactPages: Record<string, Configuration> = {
  "Recruit.Contacts.Page": {
    id: "Recruit.Contacts.Page",
    elements: [{ id: "contacts", type: "component", componentType: "Recruit.Contacts.Component" }],
  },
  "Recruit.ContactForm.Page": {
    id: "Recruit.ContactForm.Page",
    elements: [
      { id: "contact-form", type: "component", componentType: "Recruit.ContactForm.Component" },
    ],
  },

  /**
   * The detail screen splits into the main column and a rail, the same 8/4 the
   * client detail uses — the hairline between them is the column's own border,
   * with the design`s gutters around it.
   */
  "Recruit.ContactDetail.Page": {
    id: "Recruit.ContactDetail.Page",
    gridContainer: { spacing: 0 },
    elements: [
      {
        id: "contact-detail-main",
        type: "configuration",
        configurationId: "Recruit.ContactDetailMain.Configuration",
        gridItem: { size: { xs: 12, lg: 8 } },
        sx: {
          pr: { lg: "26px" },
          borderRight: { lg: "1px solid" },
          borderColor: { lg: "divider" },
        },
      },
      {
        id: "contact-detail-rail",
        type: "configuration",
        configurationId: "Recruit.ContactDetailRail.Configuration",
        gridItem: { size: { xs: 12, lg: 4 } },
        sx: { pl: { lg: "22px" }, pt: { xs: "20px", lg: 0 } },
      },
    ],
  },

  "Recruit.ContactDetailMain.Configuration": {
    id: "Recruit.ContactDetailMain.Configuration",
    stackContainer: { spacing: 2.5 },
    elements: [
      {
        id: "contact-detail-header",
        type: "component",
        componentType: "Recruit.ContactDetailHeader.Component",
      },
      {
        id: "contact-detail-briefing",
        type: "component",
        componentType: "Recruit.ContactDetailBriefing.Component",
      },
      {
        id: "contact-detail-waiting",
        type: "component",
        componentType: "Recruit.ContactDetailWaiting.Component",
      },
      {
        id: "contact-detail-stats",
        type: "component",
        componentType: "Recruit.ContactDetailStats.Component",
      },
      {
        id: "contact-detail-workspace",
        type: "component",
        componentType: "Recruit.ContactDetailWorkspace.Component",
      },
    ],
  },

  "Recruit.ContactDetailRail.Configuration": {
    id: "Recruit.ContactDetailRail.Configuration",
    stackContainer: { spacing: 2 },
    elements: [
      {
        id: "contact-detail-info",
        type: "component",
        componentType: "Recruit.ContactDetailInfo.Component",
      },
      {
        id: "contact-detail-relationship",
        type: "component",
        componentType: "Recruit.ContactDetailRelationship.Component",
      },
      {
        id: "contact-detail-client",
        type: "component",
        componentType: "Recruit.ContactDetailClient.Component",
      },
    ],
  },
};
