import { Elysia, t } from "elysia";
import * as candidateController from "../controllers/candidate.controller";
import { authGuard } from "../plugins/auth-guard";

const attachmentList = t.Array(
  t.Object({
    name: t.String(),
    url: t.String(),
    size: t.Optional(t.Number()),
    type: t.Optional(t.String()),
  }),
);

const candidateBody = t.Object({
  salutation: t.Optional(t.String({ maxLength: 10 })),
  firstName: t.Optional(t.String({ maxLength: 100 })),
  lastName: t.Optional(t.String({ maxLength: 100 })),
  email: t.Optional(t.String({ maxLength: 255 })),
  secondaryEmail: t.Optional(t.String({ maxLength: 255 })),
  phone: t.Optional(t.String({ maxLength: 30 })),
  mobile: t.Optional(t.String({ maxLength: 30 })),
  website: t.Optional(t.String({ maxLength: 255 })),
  address: t.Optional(
    t.Object({
      street: t.Optional(t.String()),
      city: t.Optional(t.String()),
      state: t.Optional(t.String()),
      postalCode: t.Optional(t.String()),
      country: t.Optional(t.String()),
    }),
  ),
  experienceYears: t.Optional(t.String({ maxLength: 20 })),
  highestQualification: t.Optional(t.String({ maxLength: 60 })),
  currentJobTitle: t.Optional(t.String({ maxLength: 150 })),
  currentEmployer: t.Optional(t.String({ maxLength: 150 })),
  currentSalary: t.Optional(t.String({ maxLength: 40 })),
  expectedSalary: t.Optional(t.String({ maxLength: 40 })),
  skillSet: t.Optional(t.Array(t.String())),
  additionalInfo: t.Optional(t.String({ maxLength: 5000 })),
  linkedin: t.Optional(t.String({ maxLength: 255 })),
  twitter: t.Optional(t.String({ maxLength: 100 })),
  github: t.Optional(t.String({ maxLength: 255 })),
  stackOverflow: t.Optional(t.String({ maxLength: 255 })),
  noticePeriod: t.Optional(t.String({ maxLength: 255 })),
  workAuthorization: t.Optional(t.String({ maxLength: 255 })),
  preferredLocation: t.Optional(t.String({ maxLength: 255 })),
  availability: t.Optional(t.String({ maxLength: 24 })),
  tags: t.Optional(t.Array(t.String())),
  doNotContact: t.Optional(t.Boolean()),
  salaryCurrency: t.Optional(t.String({ maxLength: 8 })),
  openToRelocate: t.Optional(t.Boolean()),
  openToRemote: t.Optional(t.Boolean()),
  education: t.Optional(
    t.Array(
      t.Object({
        institution: t.Optional(t.String()),
        major: t.Optional(t.String()),
        degree: t.Optional(t.String()),
        fromMonth: t.Optional(t.String()),
        fromYear: t.Optional(t.String()),
        toMonth: t.Optional(t.String()),
        toYear: t.Optional(t.String()),
        currentlyPursuing: t.Optional(t.Boolean()),
      }),
    ),
  ),
  experience: t.Optional(
    t.Array(
      t.Object({
        jobTitle: t.Optional(t.String()),
        company: t.Optional(t.String()),
        summary: t.Optional(t.String()),
        fromMonth: t.Optional(t.String()),
        fromYear: t.Optional(t.String()),
        toMonth: t.Optional(t.String()),
        toYear: t.Optional(t.String()),
        current: t.Optional(t.Boolean()),
      }),
    ),
  ),
  resume: t.Optional(attachmentList),
  formattedResume: t.Optional(attachmentList),
  coverLetter: t.Optional(attachmentList),
  offer: t.Optional(attachmentList),
  contracts: t.Optional(attachmentList),
  attachments: t.Optional(attachmentList),
  jobId: t.Optional(t.String()),
  startingStage: t.Optional(t.String({ maxLength: 40 })),
  status: t.Optional(t.String()),
  ownerId: t.Optional(t.String()),
  source: t.Optional(t.String({ maxLength: 40 })),
  emailOptOut: t.Optional(t.Boolean()),
});

export default new Elysia({ name: "candidate.routes" })
  .use(authGuard)
  .get("/candidates", (ctx) => candidateController.getCandidates(ctx), {
    isAuth: true,
    query: t.Object({
      search: t.Optional(t.String()),
      status: t.Optional(t.String()),
      jobId: t.Optional(t.String()),
      page: t.Optional(t.String()),
      pageSize: t.Optional(t.String()),
      sortKey: t.Optional(t.String()),
      sortDir: t.Optional(t.String()),
    }),
  })
  /** The same check every intake path runs — see findDuplicateCandidates. */
  .get("/candidates/duplicates", (ctx) => candidateController.getDuplicates(ctx), {
    isAuth: true,
    query: t.Object({
      email: t.Optional(t.String()),
      secondaryEmail: t.Optional(t.String()),
      phone: t.Optional(t.String()),
      mobile: t.Optional(t.String()),
      linkedin: t.Optional(t.String()),
      excludeId: t.Optional(t.String()),
    }),
  })
  .get("/candidates/:id", (ctx) => candidateController.getCandidateById(ctx), { isAuth: true })
  // The detail screen — one endpoint per card.
  .get("/candidates/:id/summary", (ctx) => candidateController.getCandidateSummary(ctx), {
    isAuth: true,
  })
  .get("/candidates/:id/assessment", (ctx) => candidateController.getCandidateAssessment(ctx), {
    isAuth: true,
  })
  .get("/candidates/:id/details", (ctx) => candidateController.getCandidateDetails(ctx), {
    isAuth: true,
  })
  .get("/candidates/:id/assignment", (ctx) => candidateController.getCandidateAssignment(ctx), {
    isAuth: true,
  })
  .get("/candidates/:id/actions", (ctx) => candidateController.getCandidateActions(ctx), {
    isAuth: true,
  })
  .get("/candidates/:id/workspace", (ctx) => candidateController.getCandidateWorkspace(ctx), {
    isAuth: true,
    query: t.Object({ tab: t.Optional(t.String()) }),
  })
  .post("/candidates", (ctx) => candidateController.postCandidate(ctx), {
    isVerified: true,
    body: t.Optional(candidateBody),
  })
  .post("/candidates/import", (ctx) => candidateController.postImport(ctx), {
    isVerified: true,
    body: t.Object({
      rows: t.Array(
        t.Object({
          values: candidateBody,
          mode: t.Optional(t.Union([t.Literal("create"), t.Literal("skip"), t.Literal("merge")])),
          targetId: t.Optional(t.String()),
          force: t.Optional(t.Boolean()),
        }),
        { maxItems: 200 },
      ),
      defaults: t.Optional(candidateBody),
    }),
  })
  .post("/candidates/:id/merge", (ctx) => candidateController.postMerge(ctx), {
    isVerified: true,
    body: t.Object({
      sourceId: t.Optional(t.String()),
      values: candidateBody,
    }),
  })
  .put("/candidates/:id", (ctx) => candidateController.putCandidate(ctx), {
    isAuth: true,
    body: t.Optional(candidateBody),
  })
  .post("/candidates/:id/archive", (ctx) => candidateController.postArchive(ctx), { isAuth: true })
  .delete("/candidates/:id", (ctx) => candidateController.removeCandidate(ctx), { isAuth: true });
