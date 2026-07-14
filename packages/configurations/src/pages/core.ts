import type { Configuration } from "@recruit/sdk";

export const CorePages: Record<string, Configuration> = {
  "Recruit.PermissionDenied.Page": {
    id: "Recruit.PermissionDenied.Page",
    elements: [
      {
        id: "permission-denied",
        type: "component",
        componentType: "Recruit.PermissionDenied.Component",
      },
    ],
  },
};
