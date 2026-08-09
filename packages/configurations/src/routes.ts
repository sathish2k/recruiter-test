import type { Route } from "@recruit/sdk";

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
    id: "Auth.VerifyEmail.Route",
    path: "verify",
    layout: "Auth.Layout",
    page: "Auth.VerifyEmail.Configuration",
    children: [],
  },
  // ponytail: placeholder destinations so auth-screen links resolve; each gets
  // its real screen when that feature lands.
  {
    id: "Recruit.GetStarted.Route",
    path: "get-started",
    layout: "Auth.Layout",
    page: "Recruit.Placeholder.Page",
    children: [],
  },
  {
    id: "Recruit.Terms.Route",
    path: "terms",
    layout: "Auth.Layout",
    page: "Recruit.Placeholder.Page",
    children: [],
  },
  {
    id: "Recruit.Privacy.Route",
    path: "privacy",
    layout: "Auth.Layout",
    page: "Recruit.Placeholder.Page",
    children: [],
  },
];
