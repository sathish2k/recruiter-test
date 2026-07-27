import type { CardRendererConfig } from "@recruit/shared";

const ID = "Recruit.DashboardAiRecommendation.Component";

export const DashboardAiRecommendationConfiguration: CardRendererConfig = {
  variant: "spotlight",
  showPath: "resumesToReview",
  header: { kicker: { name: "kicker", icon: "sparkle", variant: "accent" } },
  body: [
    {
      value: {
        type: "static-translation",
        id: ID,
        key: "title",
        value: "resumesToReview",
        sx: { fontSize: 16, fontWeight: 700, lineHeight: 1.3 },
      },
    },
  ],
  // The whole card is the link (as in the design), so the CTA is decorative —
  // giving it its own `link` would nest an <a> inside an <a>.
  footer: {
    actions: [{ label: { name: "actions.review" }, variant: "ghost" }],
  },
  link: {
    id: ID,
    linkType: "route",
    routeId: "Recruit.AiScreening.Route",
    target: "_self",
    underline: "none",
    color: "inherit",
  },
};
