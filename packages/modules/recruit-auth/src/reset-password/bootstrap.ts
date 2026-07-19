import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { AuthResetPasswordComponent } from "./reset-password.component";
import { ResetPasswordConfiguration } from "./reset-password.configuration";
import { resetPasswordDatasource } from "./reset-password.datasource";
import fallbackTranslation from "./reset-password.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Auth.ResetPassword.Configuration",
  type: "CONFIGURATION",
  value: ResetPasswordConfiguration,
};

const TRANSLATION: ComponentDependency = {
  id: "Auth.ResetPassword.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const DATASOURCE: ComponentDependency = {
  id: "Auth.ResetPassword.Datasource",
  type: "DATASOURCE",
  value: resetPasswordDatasource,
};

export const RESET_PASSWORD_COMPONENT: ComponentDefinition = {
  id: "Auth.ResetPassword.Component",
  type: "COMPONENT",
  value: AuthResetPasswordComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
