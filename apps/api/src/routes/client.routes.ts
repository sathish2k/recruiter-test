import { Elysia, t } from "elysia";
import * as clientController from "../controllers/client.controller";
import { authGuard } from "../plugins/auth-guard";

const attachmentList = t.Array(
  t.Object({
    name: t.String(),
    url: t.String(),
    size: t.Optional(t.Number()),
    type: t.Optional(t.String()),
  }),
);

const addressShape = t.Object({
  street: t.Optional(t.String()),
  city: t.Optional(t.String()),
  state: t.Optional(t.String()),
  postalCode: t.Optional(t.String()),
  country: t.Optional(t.String()),
});

const clientBody = t.Object({
  name: t.Optional(t.String({ maxLength: 150 })),
  parentCompany: t.Optional(t.String({ maxLength: 150 })),
  primaryContactId: t.Optional(t.String()),
  industry: t.Optional(t.String({ maxLength: 100 })),
  website: t.Optional(t.String({ maxLength: 255 })),
  phone: t.Optional(t.String({ maxLength: 30 })),
  billingEmail: t.Optional(t.String({ maxLength: 255 })),
  address: t.Optional(addressShape),
  shippingAddress: t.Optional(addressShape),
  shippingSameAsBilling: t.Optional(t.Boolean()),
  contract: t.Optional(attachmentList),
  attachments: t.Optional(attachmentList),
  accountLeadId: t.Optional(t.String()),
  source: t.Optional(t.String({ maxLength: 40 })),
  feeBasis: t.Optional(t.String()),
  feeValue: t.Optional(t.String({ maxLength: 40 })),
  paymentTerms: t.Optional(t.String({ maxLength: 60 })),
  taxId: t.Optional(t.String({ maxLength: 40 })),
  notes: t.Optional(t.String({ maxLength: 5000 })),
  status: t.Optional(t.String()),
  health: t.Optional(t.String()),
  logo: t.Optional(t.String()),
  linkedin: t.Optional(t.String({ maxLength: 255 })),
  careerPage: t.Optional(t.String({ maxLength: 255 })),
  timezone: t.Optional(t.String({ maxLength: 60 })),
  companySize: t.Optional(t.String({ maxLength: 40 })),
  annualHiringVolume: t.Optional(t.String({ maxLength: 40 })),
  replacementPeriod: t.Optional(t.String({ maxLength: 40 })),
});

export default new Elysia({ name: "client.routes" })
  .use(authGuard)
  .get("/clients", (ctx) => clientController.getClients(ctx), {
    isAuth: true,
    query: t.Object({
      search: t.Optional(t.String()),
      status: t.Optional(t.String()),
      health: t.Optional(t.String()),
      page: t.Optional(t.String()),
      pageSize: t.Optional(t.String()),
      sortKey: t.Optional(t.String()),
      sortDir: t.Optional(t.String()),
    }),
  })
  .get("/clients/stats", (ctx) => clientController.getClientStats(ctx), { isAuth: true })
  .get("/clients/:id", (ctx) => clientController.getClientById(ctx), { isAuth: true })
  .post("/clients", (ctx) => clientController.postClient(ctx), {
    isAuth: true,
    body: t.Optional(clientBody),
  })
  .put("/clients/:id", (ctx) => clientController.putClient(ctx), {
    isAuth: true,
    body: t.Optional(clientBody),
  })
  .delete("/clients/:id", (ctx) => clientController.removeClient(ctx), { isAuth: true });
