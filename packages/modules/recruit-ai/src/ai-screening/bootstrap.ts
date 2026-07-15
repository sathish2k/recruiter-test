import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { AiScreeningComponent } from "./ai-screening.component";
import { AiScreeningConfiguration } from "./ai-screening.configuration";
import { aiScreeningDatasource } from "./ai-screening.datasource";
import fallbackTranslation from "./ai-screening.translations.json";

const AI_SCREENING_CONFIGURATION: ComponentDependency = {
  id: "Recruit.AiScreening.Configuration",
  type: "CONFIGURATION",
  value: AiScreeningConfiguration,
};

const AI_SCREENING_TRANSLATION: ComponentDependency = {
  id: "Recruit.AiScreening.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const AI_SCREENING_DATASOURCE: ComponentDependency = {
  id: "Recruit.AiScreening.Datasource",
  type: "DATASOURCE",
  value: aiScreeningDatasource,
};

export const AI_SCREENING_COMPONENT: ComponentDefinition = {
  id: "Recruit.AiScreening.Component",
  type: "COMPONENT",
  value: AiScreeningComponent,
  default: {
    configuration: AI_SCREENING_CONFIGURATION,
    translation: AI_SCREENING_TRANSLATION,
    datasource: AI_SCREENING_DATASOURCE,
  },
};
