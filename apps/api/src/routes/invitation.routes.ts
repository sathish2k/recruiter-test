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
    body: t.Object({
      email: t.String({ format: "email" }),
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
