import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { LegalDocument } from "@recruit/shared";
import privacyTranslation from "./privacy.translations.json";
import termsTranslation from "./terms.translations.json";

// Terms and Privacy differ only in their words, so both bind the same renderer
// with a different dependency bundle rather than each getting a wrapper.
const backToSignUp = { routeId: "Auth.CreateAccount.Route", underline: "none" as const };

const TERMS_CONFIGURATION: ComponentDependency = {
  id: "Recruit.Terms.Configuration",
  type: "CONFIGURATION",
  value: {
    sectionCount: termsTranslation.sections.length,
    links: { back: backToSignUp },
    // Placeholder wording — see the notice the flag renders on the page.
    draft: true,
  },
};

const PRIVACY_CONFIGURATION: ComponentDependency = {
  id: "Recruit.Privacy.Configuration",
  type: "CONFIGURATION",
  value: {
    sectionCount: privacyTranslation.sections.length,
    links: { back: backToSignUp },
    draft: true,
  },
};

export const TERMS_COMPONENT: ComponentDefinition = {
  id: "Recruit.Terms.Component",
  type: "COMPONENT",
  value: LegalDocument,
  default: {
    configuration: TERMS_CONFIGURATION,
    translation: {
      id: "Recruit.Terms.Translation",
      type: "TRANSLATION",
      value: { fallback: termsTranslation },
    },
  },
};

export const PRIVACY_COMPONENT: ComponentDefinition = {
  id: "Recruit.Privacy.Component",
  type: "COMPONENT",
  value: LegalDocument,
  default: {
    configuration: PRIVACY_CONFIGURATION,
    translation: {
      id: "Recruit.Privacy.Translation",
      type: "TRANSLATION",
      value: { fallback: privacyTranslation },
    },
  },
};
