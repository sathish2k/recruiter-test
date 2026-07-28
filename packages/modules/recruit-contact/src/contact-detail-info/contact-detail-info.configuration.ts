import type { DetailFieldConfig, ListRowConfig } from "@recruit/shared";

/** The rail's "Contact info" card: reachable channels, then the facts under a
 * divider. */
export interface ContactDetailInfoConfiguration {
  title: { name: string };
  /** Channel rows — icon, value and its copy/open actions. */
  row: ListRowConfig;
  /** Key/value rows under the divider. */
  fields: DetailFieldConfig[];
}

const ID = "Recruit.ContactDetailInfo.Component";

export const ContactDetailInfoConfiguration: ContactDetailInfoConfiguration = {
  title: { name: "info.title" },
  row: {
    keyPath: "key",
    leading: { type: "icon", path: "icon", size: 16 },
    title: { type: "text", path: "value" },
    action: {
      type: "actions",
      actions: [{ id: ID, icon: "arrow-forward", href: "{href}", type: "open" }],
    },
  },
  fields: [
    { key: "channel", label: "info.preferredChannel", path: "channelLabel" },
    { key: "timezone", label: "info.timezone", path: "timezone" },
  ],
};
