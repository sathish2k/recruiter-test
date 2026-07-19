import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { NotificationsComponent } from "./notifications.component";
import { NotificationsConfiguration } from "./notifications.configuration";
import { notificationsDatasource } from "./notifications.datasource";
import fallbackTranslation from "./notifications.translations.json";

const NOTIFICATIONS_CONFIGURATION: ComponentDependency = {
  id: "Recruit.Notifications.Configuration",
  type: "CONFIGURATION",
  value: NotificationsConfiguration,
};

const NOTIFICATIONS_TRANSLATION: ComponentDependency = {
  id: "Recruit.Notifications.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const NOTIFICATIONS_DATASOURCE: ComponentDependency = {
  id: "Recruit.Notifications.Datasource",
  type: "DATASOURCE",
  value: notificationsDatasource,
};

export const NOTIFICATIONS_COMPONENT: ComponentDefinition = {
  id: "Recruit.Notifications.Component",
  type: "COMPONENT",
  value: NotificationsComponent,
  default: {
    configuration: NOTIFICATIONS_CONFIGURATION,
    translation: NOTIFICATIONS_TRANSLATION,
    datasource: NOTIFICATIONS_DATASOURCE,
  },
};
