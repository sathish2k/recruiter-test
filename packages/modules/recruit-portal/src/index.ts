import type { Module } from "@recruit/sdk";
import { CLIENT_PORTAL_COMPONENT } from "./client-portal/bootstrap";
import { PORTAL_LOGIN_COMPONENT } from "./portal-login/bootstrap";

export const PortalModule: Module = {
  id: "Portal.Module",
  components: [PORTAL_LOGIN_COMPONENT, CLIENT_PORTAL_COMPONENT],
};
