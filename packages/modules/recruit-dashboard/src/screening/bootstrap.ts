import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { ScreeningComponent } from "./screening.component";
import { screeningDatasource } from "./screening.datasource";
import fallbackTranslation from "./screening.translations.json";

const SCREENING_CONFIGURATION: ComponentDependency = {
  id: "Recruit.Screening.Configuration",
  type: "CONFIGURATION",
  value: {},
};

const SCREENING_TRANSLATION: ComponentDependency = {
  id: "Recruit.Screening.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const SCREENING_DATASOURCE: ComponentDependency = {
  id: "Recruit.Screening.Datasource",
  type: "DATASOURCE",
  value: screeningDatasource,
};

export const SCREENING_COMPONENT: ComponentDefinition = {
  id: "Recruit.Screening.Component",
  type: "COMPONENT",
  value: ScreeningComponent,
  default: {
    configuration: SCREENING_CONFIGURATION,
    translation: SCREENING_TRANSLATION,
    datasource: SCREENING_DATASOURCE,
  },
};
