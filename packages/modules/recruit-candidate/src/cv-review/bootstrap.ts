import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { CvReviewComponent } from "./cv-review.component";
import { CvReviewConfiguration } from "./cv-review.configuration";
import { cvReviewDatasource } from "./cv-review.datasource";
import fallbackTranslation from "./cv-review.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.CvReview.Configuration",
  type: "CONFIGURATION",
  value: CvReviewConfiguration,
};

const TRANSLATION: ComponentDependency = {
  id: "Recruit.CvReview.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const DATASOURCE: ComponentDependency = {
  id: "Recruit.CvReview.Datasource",
  type: "DATASOURCE",
  value: cvReviewDatasource,
};

export const CV_REVIEW_COMPONENT: ComponentDefinition = {
  id: "Recruit.CvReview.Component",
  type: "COMPONENT",
  value: CvReviewComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
