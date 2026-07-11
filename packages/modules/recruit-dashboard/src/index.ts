import type { Module } from "@recruit/sdk";
import { WELCOME_COMPONENT } from "./welcome/bootstrap";

export const DashboardModule: Module = {
  id: "Dashboard.Module",
  components: [WELCOME_COMPONENT],
};
