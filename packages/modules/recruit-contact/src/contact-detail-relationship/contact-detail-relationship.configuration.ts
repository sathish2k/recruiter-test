import type { DetailFieldConfig, EntityRendererConfig } from "@recruit/shared";

/** The rail's relationship card: owner, health band, and the facts behind a
 * "more details" toggle. */
export interface ContactDetailRelationshipConfiguration {
  title: { name: string };
  owner: EntityRendererConfig;
  changeOwner: { label: { name: string }; routeId: string };
  healthLabel: { name: string };
  lastTouchLabel: { name: string };
  replyLabel: { name: string };
  moreLabel: { show: string; hide: string };
  fields: DetailFieldConfig[];
}

export const ContactDetailRelationshipConfiguration: ContactDetailRelationshipConfiguration = {
  title: { name: "relationship.title" },
  owner: {
    type: "entity",
    shape: "circle",
    size: 30,
    hashPath: "ownerName",
    title: "ownerName",
    subtitle: "ownerRole",
    titleSx: { fontSize: 12.5, fontWeight: 600 },
    subtitleSx: { fontSize: 10.5 },
  },
  changeOwner: { label: { name: "relationship.change" }, routeId: "Recruit.ContactEdit.Route" },
  healthLabel: { name: "relationship.health" },
  lastTouchLabel: { name: "relationship.lastTouch" },
  replyLabel: { name: "relationship.avgReply" },
  moreLabel: { show: "relationship.more", hide: "relationship.less" },
  fields: [
    { key: "reference", label: "relationship.reference", path: "reference" },
    { key: "source", label: "relationship.source", path: "source", translate: "source" },
    { key: "added", label: "relationship.added", path: "addedLabel" },
    { key: "replyRate", label: "relationship.replyRate", path: "replyRateLabel" },
    { key: "interactions", label: "relationship.interactions", path: "interactions90d" },
  ],
};
