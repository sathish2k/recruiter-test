import type { Configuration } from "@recruit/sdk";

export const OnboardingPages: Record<string, Configuration> = {
  "Recruit.GetStarted.Page": {
    id: "Recruit.GetStarted.Page",
    elements: [
      {
        id: "onboarding-get-started",
        type: "component",
        componentType: "Onboarding.GetStarted.Component",
      },
    ],
  },
  "Recruit.Setup.Page": {
    id: "Recruit.Setup.Page",
    elements: [
      {
        id: "onboarding-setup-wizard",
        type: "component",
        componentType: "Onboarding.SetupWizard.Component",
      },
    ],
  },
};
