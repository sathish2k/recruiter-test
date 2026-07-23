export interface NotificationItem {
  key: string;
  title: string;
}

export interface NotificationGroup {
  icon: string;
  label: string;
  items: NotificationItem[];
}

export interface NotificationsConfiguration {
  groups: NotificationGroup[];
}

export const NotificationsConfiguration: NotificationsConfiguration = {
  groups: [
    {
      icon: "group",
      label: "groups.candidates",
      items: [
        { key: "newApplicants", title: "items.newApplicants" },
        { key: "weeklyDigest", title: "items.weeklyDigest" },
      ],
    },
    {
      icon: "event",
      label: "groups.interviews",
      items: [
        { key: "interviewReminders", title: "items.interviewReminders" },
        { key: "mentions", title: "items.mentions" },
      ],
    },
    {
      icon: "notifications",
      label: "groups.product",
      items: [{ key: "productUpdates", title: "items.productUpdates" }],
    },
  ],
};
