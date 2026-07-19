import type { LinkRendererConfig } from "@recruit/shared";

export interface NotificationFilter {
  /** Filter chip key; `kind` is the notification.kind it matches (absent = all). */
  key: string;
  label: string;
  kind?: "client" | "ai" | "team" | "system";
}

export interface KindStyle {
  fg: string;
  bg: string;
}

export interface NotificationsConfig {
  filters: NotificationFilter[];
  dayGroups: string[];
  kindStyles: Record<string, KindStyle>;
  kindLabels: Record<string, string>;
  profileLink: LinkRendererConfig;
}

export const NotificationsConfiguration: NotificationsConfig = {
  filters: [
    { key: "all", label: "filters.all" },
    { key: "client", label: "filters.client", kind: "client" },
    { key: "ai", label: "filters.ai", kind: "ai" },
    { key: "team", label: "filters.team", kind: "team" },
    { key: "system", label: "filters.system", kind: "system" },
  ],
  dayGroups: ["TODAY", "YESTERDAY", "EARLIER"],
  kindStyles: {
    client: { fg: "#8FD6AC", bg: "rgba(78,168,116,0.14)" },
    ai: { fg: "#FF9D57", bg: "rgba(242,106,27,0.14)" },
    team: { fg: "#9BB8D9", bg: "rgba(90,130,180,0.14)" },
    system: { fg: "#F0C27C", bg: "rgba(214,155,60,0.14)" },
  },
  kindLabels: {
    client: "kinds.client",
    ai: "kinds.ai",
    team: "kinds.team",
    system: "kinds.system",
  },
  profileLink: {
    routeId: "Recruit.Profile.Route",
    label: { name: "footer.link" },
  },
};
