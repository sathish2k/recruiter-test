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
  "Recruit.Terms.Page": {
    id: "Recruit.Terms.Page",
    elements: [
      {
        id: "terms",
        type: "component",
        componentType: "Recruit.Terms.Component",
      },
    ],
  },
  "Recruit.Privacy.Page": {
    id: "Recruit.Privacy.Page",
    elements: [
      {
        id: "privacy",
        type: "component",
        componentType: "Recruit.Privacy.Component",
      },
    ],
  },
  // Has no route: the engine falls back to this id when a slug matches nothing,
  // so the 404 renders in place with the original URL intact.
  "Recruit.NotFound.Page": {
    id: "Recruit.NotFound.Page",
    elements: [
      {
        id: "not-found",
        type: "component",
        componentType: "Recruit.NotFound.Component",
      },
    ],
  },
};
