import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { AuthLoginComponent } from "./sign-in.component";
import { SignInConfiguration } from "./sign-in.configuration";
import fallbackTranslation from "./sign-in.translations.json";

const SIGN_IN_CONFIGURATION: ComponentDependency = {
  id: "Auth.SignIn.Configuration",
  type: "CONFIGURATION",
  value: SignInConfiguration,
};

const SIGN_IN_TRANSLATION: ComponentDependency = {
  id: "Auth.SignIn.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

export const SIGN_IN_COMPONENT: ComponentDefinition = {
  id: "Auth.Login.Component",
  type: "COMPONENT",
  value: AuthLoginComponent,
  default: {
    configuration: SIGN_IN_CONFIGURATION,
    translation: SIGN_IN_TRANSLATION,
  },
};
