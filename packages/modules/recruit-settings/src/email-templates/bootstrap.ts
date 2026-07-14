import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { EmailTemplatesComponent } from "./email-templates.component";
import { EmailTemplatesConfiguration } from "./email-templates.configuration";
import { emailTemplatesDatasource } from "./email-templates.datasource";
import fallbackTranslation from "./email-templates.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.EmailTemplates.Configuration",
  type: "CONFIGURATION",
  value: EmailTemplatesConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.EmailTemplates.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.EmailTemplates.Datasource",
  type: "DATASOURCE",
  value: emailTemplatesDatasource,
};

export const EMAIL_TEMPLATES_COMPONENT: ComponentDefinition = {
  id: "Recruit.EmailTemplates.Component",
  type: "COMPONENT",
  value: EmailTemplatesComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
