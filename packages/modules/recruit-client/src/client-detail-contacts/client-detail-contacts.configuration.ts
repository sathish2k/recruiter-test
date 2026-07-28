import type { ListRendererConfig } from "@recruit/shared";

const ID = "Recruit.ClientDetailContacts.Component";

export const ClientDetailContactsConfiguration: ListRendererConfig = {
  title: { name: "contacts.title" },
  titleScale: "rail",
  headerTextLink: {
    label: { name: "contacts.viewAll" },
    link: { routeId: "Recruit.Contacts.Route" },
  },
  divided: true,
  headerGap: "12px",
  row: {
    keyPath: "id",
    leading: {
      type: "entity",
      shape: "circle",
      size: 34,
      avatarOnly: true,
      hashPath: "name",
      title: "name",
    },
    title: { type: "text", path: "name" },
    description: { type: "text", path: "title" },
    chips: {
      type: "status",
      id: ID,
      path: "isPrimary",
      onlyMapped: true,
      labels: { true: "contacts.primary" },
      colors: { true: "primary" },
    },
    action: {
      type: "actions",
      actions: [
        { icon: "mail", href: "mailto:{email}" },
        { icon: "call", href: "tel:{phone}" },
      ],
    },
  },
  emptyText: { name: "contacts.empty" },
};
