import { Elysia, t } from "elysia";
import * as contactController from "../controllers/contact.controller";
import { authGuard } from "../plugins/auth-guard";

const contactBody = t.Object({
  salutation: t.Optional(t.String({ maxLength: 10 })),
  firstName: t.Optional(t.String({ maxLength: 100 })),
  lastName: t.Optional(t.String({ maxLength: 100 })),
  email: t.Optional(t.String({ maxLength: 255 })),
  secondaryEmail: t.Optional(t.String({ maxLength: 255 })),
  phone: t.Optional(t.String({ maxLength: 30 })),
  mobile: t.Optional(t.String({ maxLength: 30 })),
  title: t.Optional(t.String({ maxLength: 150 })),
  department: t.Optional(t.String({ maxLength: 100 })),
  linkedin: t.Optional(t.String({ maxLength: 255 })),
  twitter: t.Optional(t.String({ maxLength: 100 })),
  source: t.Optional(t.String({ maxLength: 40 })),
  notes: t.Optional(t.String({ maxLength: 5000 })),
  attachments: t.Optional(
    t.Array(
      t.Object({
        name: t.String(),
        url: t.String(),
        size: t.Optional(t.Number()),
        type: t.Optional(t.String()),
      }),
    ),
  ),
  clientId: t.Optional(t.String()),
  ownerId: t.Optional(t.String()),
  status: t.Optional(t.String()),
  isPrimary: t.Optional(t.Boolean()),
  emailOptOut: t.Optional(t.Boolean()),
  type: t.Optional(t.String()),
});

export default new Elysia({ name: "contact.routes" })
  .use(authGuard)
  .get("/contacts", (ctx) => contactController.getContacts(ctx), {
    isAuth: true,
    query: t.Object({
      search: t.Optional(t.String()),
      client: t.Optional(t.String()),
      owner: t.Optional(t.String()),
      page: t.Optional(t.String()),
      pageSize: t.Optional(t.String()),
      sortKey: t.Optional(t.String()),
      sortDir: t.Optional(t.String()),
    }),
  })
  .get("/contacts/duplicates", (ctx) => contactController.getDuplicates(ctx), {
    isAuth: true,
    query: t.Object({
      clientId: t.Optional(t.String()),
      email: t.Optional(t.String()),
      mobile: t.Optional(t.String()),
      firstName: t.Optional(t.String()),
      lastName: t.Optional(t.String()),
      excludeId: t.Optional(t.String()),
    }),
  })
  .get("/contacts/:id", (ctx) => contactController.getContactById(ctx), { isAuth: true })
  .post("/contacts", (ctx) => contactController.postContact(ctx), {
    isAuth: true,
    body: t.Optional(contactBody),
  })
  .put("/contacts/:id", (ctx) => contactController.putContact(ctx), {
    isAuth: true,
    body: t.Optional(contactBody),
  })
  .delete("/contacts/:id", (ctx) => contactController.removeContact(ctx), { isAuth: true })
  .post("/contacts/:id/archive", (ctx) => contactController.postArchive(ctx), { isAuth: true })
  .post("/contacts/:id/primary", (ctx) => contactController.postPrimary(ctx), { isAuth: true });
