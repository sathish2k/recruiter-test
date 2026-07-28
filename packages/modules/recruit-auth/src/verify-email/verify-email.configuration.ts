import type { LinkRendererConfig } from "@recruit/shared";

const accentSx = {
  fontWeight: 600,
  color: "surface.primarySoftFg",
  textDecoration: "none",
  "&:hover": { color: "primary.light" },
};

const links: Record<string, LinkRendererConfig> = {
  signIn: {
    routeId: "Auth.CreateAccount.Route",
    underline: "none",
    sx: { ...accentSx, fontSize: 13 },
  },
  getStarted: {
    routeId: "Recruit.GetStarted.Route",
    underline: "none",
  },
};

export const VerifyEmailConfiguration = { links };
