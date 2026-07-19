import type { Configuration } from "@recruit/sdk";

export const layouts: Configuration[] = [
  {
    id: "Recruit.Core.Layout",
    template: "core",
    elements: [
      {
        id: "Recruit.Sidenav.Layout",
        type: "component",
        componentType: "Recruit.Sidenav.Component",
        position: "left",
      },
      {
        id: "Recruit.Appbar.Layout",
        type: "component",
        componentType: "Recruit.Appbar.Component",
        position: "top",
      },
      { id: "Recruit.Core.Outlet.Layout", type: "outlet", position: "main" },
    ],
  },
  {
    id: "Auth.Layout",
    template: "custom",
    elements: [
      {
        id: "Auth.Backdrop.Layout",
        type: "component",
        componentType: "Auth.Backdrop.Component",
      },
      { id: "Auth.Outlet.Layout", type: "outlet" },
    ],
  },
  {
    id: "Recruit.Bare.Layout",
    template: "custom",
    elements: [{ id: "Recruit.Bare.Outlet.Layout", type: "outlet" }],
  },
];
