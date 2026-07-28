import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { AuthVerifyEmailComponent } from "./verify-email.component";
import { VerifyEmailConfiguration } from "./verify-email.configuration";
import { verifyEmailDatasource } from "./verify-email.datasource";
import fallbackTranslation from "./verify-email.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Auth.VerifyEmail.Configuration",
  type: "CONFIGURATION",
  value: VerifyEmailConfiguration,
};

const TRANSLATION: ComponentDependency = {
  id: "Auth.VerifyEmail.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const DATASOURCE: ComponentDependency = {
  id: "Auth.VerifyEmail.Datasource",
  type: "DATASOURCE",
  value: verifyEmailDatasource,
};

export const VERIFY_EMAIL_COMPONENT: ComponentDefinition = {
  id: "Auth.VerifyEmail.Component",
  type: "COMPONENT",
  value: AuthVerifyEmailComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
