import { Elysia, t } from "elysia";
import * as assetController from "../controllers/asset.controller";
import { authGuard } from "../plugins/auth-guard";

export default new Elysia({ name: "asset.routes" })
  .use(authGuard)
  .get("/assets", (ctx) => assetController.getAssets(ctx), {
    isAuth: true,
    query: t.Object({
      entityType: t.Optional(t.String()),
      entityId: t.Optional(t.String()),
      type: t.Optional(t.String()),
    }),
  })
  .post("/assets", (ctx) => assetController.postAsset(ctx), {
    isAuth: true,
    body: t.Object({
      file: t.File(),
      entityType: t.String(),
      entityId: t.Optional(t.String()),
      type: t.String(),
    }),
  })
  .get("/assets/:id/url", (ctx) => assetController.getAssetUrl(ctx), { isAuth: true })
  .delete("/assets/:id", (ctx) => assetController.deleteAsset(ctx), { isAuth: true });
