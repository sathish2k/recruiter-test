import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { AuthLoginComponent } from "./sign-in.component";
import fallbackTranslation from "./sign-in.translations.json";

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
    translation: SIGN_IN_TRANSLATION,
  },
};
