import type { Route } from "@recruit/sdk";

export const routes: Route[] = [
  {
    id: "Recruit.Root",
    path: "/",
    layout: "Recruit.Core.Layout",
    page: "Recruit.Home.Page",
    guard: [{ type: "authenticationGuard" }],
    children: [],
  },
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
];
