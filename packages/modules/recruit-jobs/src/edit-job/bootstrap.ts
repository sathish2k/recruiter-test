import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { EditJobComponent } from "./edit-job.component";
import { EditJobConfiguration } from "./edit-job.configuration";
import { editJobDatasource } from "./edit-job.datasource";
import fallbackTranslation from "./edit-job.translations.json";

const EDIT_JOB_CONFIGURATION: ComponentDependency = {
  id: "Recruit.EditJob.Configuration",
  type: "CONFIGURATION",
  value: EditJobConfiguration,
};

const EDIT_JOB_TRANSLATION: ComponentDependency = {
  id: "Recruit.EditJob.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const EDIT_JOB_DATASOURCE: ComponentDependency = {
  id: "Recruit.EditJob.Datasource",
  type: "DATASOURCE",
  value: editJobDatasource,
};

export const EDIT_JOB_COMPONENT: ComponentDefinition = {
  id: "Recruit.EditJob.Component",
  type: "COMPONENT",
  value: EditJobComponent,
  default: {
    configuration: EDIT_JOB_CONFIGURATION,
    translation: EDIT_JOB_TRANSLATION,
    datasource: EDIT_JOB_DATASOURCE,
  },
};
