import type { Module } from "@recruit/sdk";
import { INTERVIEWS_COMPONENT } from "./interviews/bootstrap";
import { PLACEMENTS_COMPONENT } from "./placements/bootstrap";
import { TEAM_ACTIVITY_COMPONENT } from "./team-activity/bootstrap";

export const OpsModule: Module = {
  id: "Ops.Module",
  components: [
    TEAM_ACTIVITY_COMPONENT,
    INTERVIEWS_COMPONENT,
    PLACEMENTS_COMPONENT,
  ],
};
