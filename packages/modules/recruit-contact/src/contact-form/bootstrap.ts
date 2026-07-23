import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { ContactFormComponent } from "./contact-form.component";
import { ContactFormConfiguration } from "./contact-form.configuration";
import { contactFormDatasource } from "./contact-form.datasource";
import fallbackTranslation from "./contact-form.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.ContactForm.Configuration",
  type: "CONFIGURATION",
  value: ContactFormConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.ContactForm.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.ContactForm.Datasource",
  type: "DATASOURCE",
  value: contactFormDatasource,
};

export const CONTACT_FORM_COMPONENT: ComponentDefinition = {
  id: "Recruit.ContactForm.Component",
  type: "COMPONENT",
  value: ContactFormComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
