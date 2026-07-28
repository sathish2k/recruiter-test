import { Elysia, t } from "elysia";
import * as onboardingController from "../controllers/onboarding.controller";
import { authGuard } from "../plugins/auth-guard";

export default new Elysia({ name: "onboarding.routes" })
  .use(authGuard)
  .get("/onboarding/checklist", (ctx) => onboardingController.getChecklist(ctx), {
    isAuth: true,
  })
  .get("/onboarding/setup", (ctx) => onboardingController.getSetup(ctx), {
    isAuth: true,
  })
  // Each wizard step posts only its own slice, so every field is optional.
  .put("/onboarding/setup", (ctx) => onboardingController.putSetup(ctx), {
    isAuth: true,
    body: t.Object({
      timezone: t.Optional(t.String()),
      currency: t.Optional(t.String()),
      dateFormat: t.Optional(t.String()),
      timeFormat: t.Optional(t.String()),
      setupStep: t.Optional(t.Number()),
      completed: t.Optional(t.Boolean()),
      stages: t.Optional(
        t.Array(t.Object({ name: t.String(), clientVisible: t.Optional(t.Boolean()) })),
      ),
      reasons: t.Optional(
        t.Array(
          t.Object({
            category: t.Union([t.Literal("client"), t.Literal("candidate"), t.Literal("internal")]),
            label: t.String(),
            active: t.Optional(t.Boolean()),
          }),
        ),
      ),
      invites: t.Optional(t.Array(t.Object({ email: t.String(), role: t.String() }))),
    }),
  });
