import type { Route } from "@recruit/sdk";

// Auth-scoped route tree. Domain routes (dashboard, jobs, …) are added as their
// modules are ported over.
export const routes: Route[] = [
  {
    id: "Auth.Login.Route",
    path: "login",
    layout: "Auth.Layout",
    page: "Auth.Login.Configuration",
    children: [],
  },
  {
    id: "Auth.CreateAccount.Route",
    path: "create-account",
    layout: "Auth.Layout",
    page: "Auth.CreateAccount.Configuration",
    children: [],
  },
  {
    id: "Auth.ForgotPassword.Route",
    path: "forgot-password",
    layout: "Auth.Layout",
    page: "Auth.ForgotPassword.Configuration",
    children: [],
  },
  {
    id: "Auth.ResetPassword.Route",
    path: "reset-password",
    layout: "Auth.Layout",
    page: "Auth.ResetPassword.Configuration",
    children: [],
  },
  {
    id: "Recruit.PermissionDenied.Route",
    path: "permission-denied",
    layout: "Recruit.Bare.Layout",
    page: "Recruit.PermissionDenied.Page",
    children: [],
  },
];
