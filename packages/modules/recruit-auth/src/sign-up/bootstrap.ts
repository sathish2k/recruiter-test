import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { AuthCreateAccountComponent } from "./sign-up.component";
import { SignUpConfiguration } from "./sign-up.configuration";
import { signUpDatasource } from "./sign-up.datasource";
import fallbackTranslation from "./sign-up.translations.json";

const SIGN_UP_CONFIGURATION: ComponentDependency = {
  id: "Auth.SignUp.Configuration",
  type: "CONFIGURATION",
  value: SignUpConfiguration,
};

const SIGN_UP_TRANSLATION: ComponentDependency = {
  id: "Auth.SignUp.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const SIGN_UP_DATASOURCE: ComponentDependency = {
  id: "Auth.SignUp.Datasource",
  type: "DATASOURCE",
  value: signUpDatasource,
};

export const SIGN_UP_COMPONENT: ComponentDefinition = {
  id: "Auth.CreateAccount.Component",
  type: "COMPONENT",
  value: AuthCreateAccountComponent,
  default: {
    configuration: SIGN_UP_CONFIGURATION,
    translation: SIGN_UP_TRANSLATION,
    datasource: SIGN_UP_DATASOURCE,
  },
};
