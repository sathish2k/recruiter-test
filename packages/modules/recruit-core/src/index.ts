import type { Module } from "@recruit/sdk";
import { APPBAR_COMPONENT } from "./appbar/bootstrap";
import { SIDENAV_COMPONENT } from "./sidenav/bootstrap";

export const CoreModule: Module = {
  id: "Core.Module",
  components: [SIDENAV_COMPONENT, APPBAR_COMPONENT],
};
