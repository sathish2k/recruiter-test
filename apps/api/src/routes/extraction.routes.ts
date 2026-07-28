import { Elysia, t } from "elysia";
import * as extractionController from "../controllers/extraction.controller";
import { authGuard } from "../plugins/auth-guard";

export default new Elysia({ name: "extraction.routes" })
  .use(authGuard)
  /** Pull the caller's requested `fields` out of an uploaded document. The
   * field list is the form's own configuration, serialized by the client. */
  .post("/extractions/document", (ctx) => extractionController.postDocumentExtraction(ctx), {
    isAuth: true,
    body: t.Object({
      file: t.File(),
      fields: t.String({ maxLength: 16384 }),
    }),
  })
  /** The same contract, over text the caller already holds. */
  .post("/extractions/text", (ctx) => extractionController.postTextExtraction(ctx), {
    isAuth: true,
    body: t.Object({
      text: t.String({ maxLength: 24000 }),
      fields: t.String({ maxLength: 16384 }),
    }),
  });
