import type { Configuration } from "@recruit/sdk";

export const layouts: Configuration[] = [
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
];
