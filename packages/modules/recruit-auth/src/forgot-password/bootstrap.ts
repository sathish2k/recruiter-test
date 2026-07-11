import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { AuthForgotPasswordComponent } from "./forgot-password.component";
import { ForgotPasswordConfiguration } from "./forgot-password.configuration";
import { forgotPasswordDatasource } from "./forgot-password.datasource";
import fallbackTranslation from "./forgot-password.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Auth.ForgotPassword.Configuration",
  type: "CONFIGURATION",
  value: ForgotPasswordConfiguration,
};

const TRANSLATION: ComponentDependency = {
  id: "Auth.ForgotPassword.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const DATASOURCE: ComponentDependency = {
  id: "Auth.ForgotPassword.Datasource",
  type: "DATASOURCE",
  value: forgotPasswordDatasource,
};

export const FORGOT_PASSWORD_COMPONENT: ComponentDefinition = {
  id: "Auth.ForgotPassword.Component",
  type: "COMPONENT",
  value: AuthForgotPasswordComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
