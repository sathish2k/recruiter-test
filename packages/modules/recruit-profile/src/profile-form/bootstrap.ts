import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { ProfileFormComponent } from "./profile-form.component";
import { ProfileFormConfiguration } from "./profile-form.configuration";
import { profileDatasource } from "./profile-form.datasource";
import fallbackTranslation from "./profile-form.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.ProfileForm.Configuration",
  type: "CONFIGURATION",
  value: ProfileFormConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.ProfileForm.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.ProfileForm.Datasource",
  type: "DATASOURCE",
  value: profileDatasource,
};

export const PROFILE_FORM_COMPONENT: ComponentDefinition = {
  id: "Recruit.ProfileForm.Component",
  type: "COMPONENT",
  value: ProfileFormComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
