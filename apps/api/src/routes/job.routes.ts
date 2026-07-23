import { Elysia, t } from "elysia";
import * as jobController from "../controllers/job.controller";
import { authGuard } from "../plugins/auth-guard";

const attachmentList = t.Array(
  t.Object({
    name: t.String(),
    url: t.String(),
    size: t.Optional(t.Number()),
    type: t.Optional(t.String()),
  }),
);

const jobBody = t.Object({
  title: t.Optional(t.String({ maxLength: 150 })),
  clientId: t.Optional(t.String()),
  clientContactId: t.Optional(t.String()),
  dateOpened: t.Optional(t.String()),
  targetDate: t.Optional(t.String()),
  employmentType: t.Optional(t.String({ maxLength: 40 })),
  workExperience: t.Optional(t.String({ maxLength: 40 })),
  industry: t.Optional(t.String({ maxLength: 100 })),
  description: t.Optional(t.String({ maxLength: 20000 })),
  requirements: t.Optional(t.String({ maxLength: 20000 })),
  benefits: t.Optional(t.String({ maxLength: 20000 })),
  skills: t.Optional(t.Array(t.String())),
  openings: t.Optional(t.Number()),
  salaryMin: t.Optional(t.String({ maxLength: 40 })),
  salaryMax: t.Optional(t.String({ maxLength: 40 })),
  status: t.Optional(t.String()),
  address: t.Optional(
    t.Object({
      city: t.Optional(t.String()),
      state: t.Optional(t.String()),
      country: t.Optional(t.String()),
      postalCode: t.Optional(t.String()),
    }),
  ),
  revenuePerPosition: t.Optional(t.String({ maxLength: 40 })),
  actualRevenue: t.Optional(t.String({ maxLength: 40 })),
  missedRevenue: t.Optional(t.String({ maxLength: 40 })),
  jobSummary: t.Optional(attachmentList),
  attachments: t.Optional(attachmentList),
  aiScreening: t.Optional(t.Boolean()),
  screeningCriteria: t.Optional(t.String({ maxLength: 2000 })),
  matchThreshold: t.Optional(t.Number()),
  autoAdvance: t.Optional(t.Boolean()),
  knockoutCount: t.Optional(t.Number()),
  dailyDigest: t.Optional(t.Boolean()),
  sourcerId: t.Optional(t.String()),
  profileLeadId: t.Optional(t.String()),
  dailyInviteTarget: t.Optional(t.Number()),
  publishChannels: t.Optional(t.Array(t.String())),
});

export default new Elysia({ name: "job.routes" })
  .use(authGuard)
  .get("/jobs", (ctx) => jobController.getJobs(ctx), {
    isAuth: true,
    query: t.Object({
      search: t.Optional(t.String()),
      status: t.Optional(t.String()),
      clientId: t.Optional(t.String()),
      page: t.Optional(t.String()),
      pageSize: t.Optional(t.String()),
      sortKey: t.Optional(t.String()),
      sortDir: t.Optional(t.String()),
    }),
  })
  .get("/jobs/:id", (ctx) => jobController.getJobById(ctx), { isAuth: true })
  .post("/jobs", (ctx) => jobController.postJob(ctx), { isAuth: true, body: t.Optional(jobBody) })
  .put("/jobs/:id", (ctx) => jobController.putJob(ctx), { isAuth: true, body: t.Optional(jobBody) })
  .delete("/jobs/:id", (ctx) => jobController.removeJob(ctx), { isAuth: true });
