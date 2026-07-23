import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { NotificationsComponent } from "./notifications.component";
import { NotificationsConfiguration } from "./notifications.configuration";
import { notificationsDatasource } from "./notifications.datasource";
import fallbackTranslation from "./notifications.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.ProfileNotifications.Configuration",
  type: "CONFIGURATION",
  value: NotificationsConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.ProfileNotifications.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.ProfileNotifications.Datasource",
  type: "DATASOURCE",
  value: notificationsDatasource,
};

export const PROFILE_NOTIFICATIONS_COMPONENT: ComponentDefinition = {
  id: "Recruit.ProfileNotifications.Component",
  type: "COMPONENT",
  value: NotificationsComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
