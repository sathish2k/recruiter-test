"use client";

import { useFetch } from "@recruit/sdk";
import { type SetupPatch, type SetupState, SetupWizard } from "@recruit/shared";

/** What the wizard renders before the first read lands. */
const EMPTY: SetupState = {
  timezone: "",
  currency: "",
  dateFormat: "",
  setupStep: 0,
  setupCompletedAt: null,
  stages: [],
  reasons: [],
  invites: [],
};

export function OnboardingSetupWizardComponent({ id }: { id: string }) {
  const { data, mutation } = useFetch<SetupState>(id);
  return (
    <SetupWizard
      id={id}
      state={data ?? EMPTY}
      // Autosave only — the wizard holds the edited copy, so re-reading here
      // would fight whatever the user is typing on the step they moved to.
      onSave={async (patch: SetupPatch) => {
        await mutation.update(patch);
      }}
    />
  );
}
