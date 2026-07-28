import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { ListRenderer } from "@recruit/shared";
import { ClientDetailSubmissionsConfiguration } from "./client-detail-submissions.configuration";
import { clientDetailSubmissionsDatasource } from "./client-detail-submissions.datasource";
import fallbackTranslation from "./client-detail-submissions.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.ClientDetailSubmissions.Configuration",
  type: "CONFIGURATION",
  value: ClientDetailSubmissionsConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.ClientDetailSubmissions.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.ClientDetailSubmissions.Datasource",
  type: "DATASOURCE",
  value: clientDetailSubmissionsDatasource,
};

export const CLIENT_DETAIL_SUBMISSIONS_COMPONENT: ComponentDefinition = {
  id: "Recruit.ClientDetailSubmissions.Component",
  type: "COMPONENT",
  value: ListRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
