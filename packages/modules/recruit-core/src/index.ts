import type { Module } from "@recruit/sdk";
import { APPBAR_COMPONENT } from "./appbar/bootstrap";
import { BREADCRUMB_COMPONENT } from "./breadcrumb/bootstrap";
import { PRIVACY_COMPONENT, TERMS_COMPONENT } from "./legal/bootstrap";
import { NOT_FOUND_COMPONENT } from "./not-found/bootstrap";
import { PERMISSION_DENIED_COMPONENT } from "./permission-denied/bootstrap";
import { SIDENAV_COMPONENT } from "./sidenav/bootstrap";

export const CoreModule: Module = {
  id: "Core.Module",
  components: [
    SIDENAV_COMPONENT,
    APPBAR_COMPONENT,
    BREADCRUMB_COMPONENT,
    PERMISSION_DENIED_COMPONENT,
    NOT_FOUND_COMPONENT,
    TERMS_COMPONENT,
    PRIVACY_COMPONENT,
  ],
};
