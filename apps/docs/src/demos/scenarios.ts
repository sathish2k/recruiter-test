import type { Configuration, Route } from "@recruit/sdk";

export const APP_ROUTES: Route[] = [
  {
    id: "Root",
    path: "/",
    layout: "Core.Layout",
    page: "Home.Page",
    children: ["Candidates", "Roles"],
  },
  {
    id: "Candidates",
    path: "candidates",
    page: "Candidates.Page",
    children: [],
  },
  { id: "Roles", path: "roles", page: "Roles.Page", children: ["RoleDetail"] },
  { id: "RoleDetail", path: ":id", page: "RoleDetail.Page", children: [] },
  {
    id: "SignIn",
    path: "signin",
    layout: "Auth.Layout",
    page: "SignIn.Page",
    children: [],
  },
];

export const APP_CONFIGS: Configuration[] = [
  {
    id: "Core.Layout",
    template: "core",
    elements: [
      {
        id: "sidebar",
        type: "component",
        componentType: "Nav.Sidebar",
        position: "left",
      },
      {
        id: "appbar",
        type: "component",
        componentType: "App.Bar",
        position: "top",
      },
      { id: "core-outlet", type: "outlet", position: "main" },
    ],
  },
  {
    id: "Auth.Layout",
    template: "auth",
    elements: [{ id: "auth-outlet", type: "outlet", position: "main" }],
  },
  {
    id: "Home.Page",
    elements: [
      { id: "welcome", type: "component", componentType: "Home.Welcome" },
    ],
  },
  {
    id: "Candidates.Page",
    elements: [
      { id: "cands", type: "component", componentType: "Candidates.Table" },
    ],
  },
  {
    id: "Roles.Page",
    elements: [
      { id: "roles", type: "component", componentType: "Panel.OpenRoles" },
    ],
  },
  {
    id: "RoleDetail.Page",
    elements: [{ id: "role", type: "component", componentType: "Role.Detail" }],
  },
  {
    id: "SignIn.Page",
    elements: [
      { id: "form", type: "component", componentType: "Auth.SignInForm" },
    ],
  },
];

export const APP_URLS = ["/", "/candidates", "/roles/42", "/signin", "/nope"];
