import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { ProfileComponent } from "./profile.component";
import { ProfileConfiguration } from "./profile.configuration";
import { profileDatasource } from "./profile.datasource";
import fallbackTranslation from "./profile.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Profile.Configuration",
  type: "CONFIGURATION",
  value: ProfileConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Profile.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Profile.Datasource",
  type: "DATASOURCE",
  value: profileDatasource,
};

export const PROFILE_COMPONENT: ComponentDefinition = {
  id: "Recruit.Profile.Component",
  type: "COMPONENT",
  value: ProfileComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
