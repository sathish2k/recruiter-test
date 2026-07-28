import type { DetailHeaderConfig } from "@recruit/shared";

const ID = "Recruit.ContactDetailHeader.Component";

const CONTACT_PARAM = { id: { type: "dynamic" as const, path: "id" } };

/** The identity row — the same shared header the client screen draws, with a
 * circular avatar and this screen's chips and actions. */
export const ContactDetailHeaderConfiguration: DetailHeaderConfig = {
  entity: {
    type: "entity",
    shape: "circle",
    size: 56,
    hashPath: "name",
    title: "name",
    subtitle: "subtitleLine",
    titleSx: { fontSize: 22, fontWeight: 700, letterSpacing: "-.01em" },
    subtitleSx: { fontSize: 13, mt: "5px" },
  },
  chips: [
    {
      type: "status",
      id: ID,
      path: "isPrimary",
      onlyMapped: true,
      variant: "badge",
      labels: { true: "chips.primary" },
      colors: { true: "primary" },
    },
    {
      type: "status",
      id: ID,
      path: "status",
      dot: true,
      labels: {
        active: "chips.active",
        inactive: "chips.inactive",
        left: "chips.left",
      },
      colors: { active: "success", inactive: "default", left: "default" },
    },
    {
      type: "status",
      id: ID,
      path: "fastResponder",
      onlyMapped: true,
      variant: "outlined",
      labels: { true: "chips.fastResponder" },
      colors: { true: "primary" },
    },
  ],
  actions: [
    { type: "email", icon: "mail", label: { name: "actions.email" }, href: "mailto:{email}" },
    {
      type: "meeting",
      icon: "event",
      label: { name: "actions.meeting" },
      routeId: "Recruit.Interviews.Route",
    },
  ],
  primaryAction: {
    type: "edit",
    icon: "edit",
    label: { name: "actions.edit" },
    routeId: "Recruit.ContactEdit.Route",
    params: CONTACT_PARAM,
  },
  menuActions: [
    {
      type: "viewClient",
      icon: "domain",
      label: { name: "actions.viewClient" },
      routeId: "Recruit.ClientDetail.Route",
      params: { id: { type: "dynamic", path: "clientId" } },
    },
    {
      type: "addRole",
      icon: "work",
      label: { name: "actions.addRole" },
      routeId: "Recruit.JobNew.Route",
    },
    {
      type: "backToList",
      icon: "group",
      label: { name: "actions.backToList" },
      routeId: "Recruit.Contacts.Route",
    },
  ],
};
