import type { Module } from "@recruit/sdk";
import { APPBAR_COMPONENT } from "./appbar/bootstrap";
import { PERMISSION_DENIED_COMPONENT } from "./permission-denied/bootstrap";
import { SIDENAV_COMPONENT } from "./sidenav/bootstrap";

export const CoreModule: Module = {
  id: "Core.Module",
  components: [
    SIDENAV_COMPONENT,
    APPBAR_COMPONENT,
    PERMISSION_DENIED_COMPONENT,
  ],
};
