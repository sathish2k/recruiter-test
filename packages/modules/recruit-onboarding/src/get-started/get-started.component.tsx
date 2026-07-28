"use client";

import { useFetch } from "@recruit/sdk";
import { GetStarted, type OnboardingChecklist } from "@recruit/shared";

const EMPTY: OnboardingChecklist & { firstName?: string } = {
  steps: [
    { key: "client", done: false },
    { key: "role", done: false },
    { key: "team", done: false },
    { key: "extension", done: false },
    { key: "calendar", done: false },
  ],
  doneCount: 0,
  total: 5,
  allDone: false,
  configured: false,
  workspaceName: "",
};

export function OnboardingGetStartedComponent({ id }: { id: string }) {
  const { data } = useFetch<OnboardingChecklist & { firstName?: string }>(id);
  const checklist = data ?? EMPTY;
  return <GetStarted id={id} checklist={checklist} firstName={checklist.firstName} />;
}
