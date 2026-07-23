import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { LanguageComponent } from "./language.component";
import { LanguageConfiguration } from "./language.configuration";
import { languageDatasource } from "./language.datasource";
import fallbackTranslation from "./language.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.ProfileLanguage.Configuration",
  type: "CONFIGURATION",
  value: LanguageConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.ProfileLanguage.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.ProfileLanguage.Datasource",
  type: "DATASOURCE",
  value: languageDatasource,
};

export const PROFILE_LANGUAGE_COMPONENT: ComponentDefinition = {
  id: "Recruit.ProfileLanguage.Component",
  type: "COMPONENT",
  value: LanguageComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
