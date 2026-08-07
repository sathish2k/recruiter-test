import type { Route } from "@recruit/sdk";

export const routes: Route[] = [
  {
    id: "Auth.Login.Route",
    path: "login",
    layout: "Auth.Layout",
    page: "Auth.Login.Configuration",
    children: [],
  },
];
