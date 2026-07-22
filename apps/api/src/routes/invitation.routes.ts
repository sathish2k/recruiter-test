import { Elysia, t } from "elysia";
import * as invitationController from "../controllers/invitation.controller";
import { authGuard } from "../plugins/auth-guard";

export default new Elysia({ name: "invitation.routes" })
  .use(authGuard)
  .get("/invitations", (ctx) => invitationController.getInvitations(ctx), {
    isAuth: true,
  })
  .post("/invitations", (ctx) => invitationController.postInvitation(ctx), {
    isAuth: true,
    // The invite modal sends one email per line, so a send is always a list.
    body: t.Object({
      emails: t.Array(t.String({ format: "email" }), { minItems: 1 }),
      role: t.Optional(t.String()),
      clientAccess: t.Optional(t.String()),
    }),
  })
  .post("/invitations/:id/resend", (ctx) => invitationController.postResend(ctx), {
    isAuth: true,
  })
  .delete("/invitations/:id", (ctx) => invitationController.deleteInvitation(ctx), {
    isAuth: true,
  });
