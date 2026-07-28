import { status } from "elysia";
import {
  applicationBoard,
  applicationHistory,
  type CreateApplicationInput,
  createApplication,
  getApplication,
  listApplications,
  type MoveInput,
  moveApplication,
  TransitionBlocked,
} from "../services/application.service";

type Auth = { agencyId?: string | null; id?: string; name?: string | null };

const actor = (ctx: { user: Auth }) => ({ id: ctx.user.id, name: ctx.user.name });

/** A blocked transition is a 409: the request was well-formed, the workspace's
 * own rules refused it. The code lets the board offer "move anyway". */
function blocked(error: unknown) {
  if (error instanceof TransitionBlocked) {
    return status(409, { error: error.message, code: error.code });
  }
  throw error;
}

export async function getApplications(ctx: {
  user: Auth;
  query: Record<string, string | undefined>;
}) {
  const data = await listApplications(ctx.user.agencyId ?? "", {
    jobId: ctx.query.jobId,
    clientId: ctx.query.clientId,
    ownerId: ctx.query.ownerId,
    candidateId: ctx.query.candidateId,
    search: ctx.query.search,
    includeClosed: ctx.query.includeClosed === "true",
  });
  return { data, meta: { totalCount: data.length } };
}

export async function getBoard(ctx: { user: Auth; query: Record<string, string | undefined> }) {
  const data = await applicationBoard(ctx.user.agencyId ?? "", {
    jobId: ctx.query.jobId,
    clientId: ctx.query.clientId,
    ownerId: ctx.query.ownerId,
    search: ctx.query.search,
    wipLimit: ctx.query.wipLimit ? Number(ctx.query.wipLimit) : undefined,
  });
  return { data };
}

export async function getApplicationById(ctx: { user: Auth; params: { id: string } }) {
  const found = await getApplication(ctx.user.agencyId ?? "", ctx.params.id);
  if (!found) return status(404, "Application not found");
  return { data: found };
}

export async function getHistory(ctx: { user: Auth; params: { id: string } }) {
  const data = await applicationHistory(ctx.user.agencyId ?? "", ctx.params.id);
  return { data };
}

export async function postApplication(ctx: { user: Auth; body?: CreateApplicationInput | null }) {
  if (!ctx.body?.candidateId || !ctx.body?.jobId) {
    return status(422, "A candidate and a requirement are both required");
  }
  try {
    const created = await createApplication(ctx.user.agencyId ?? "", actor(ctx), ctx.body);
    if (!created) return status(422, "Could not create the application");
    return status(201, { data: created });
  } catch (error) {
    return blocked(error);
  }
}

export async function postMove(ctx: {
  user: Auth;
  params: { id: string };
  body?: MoveInput | null;
}) {
  try {
    const moved = await moveApplication(ctx.user.agencyId ?? "", actor(ctx), ctx.params.id, {
      ...(ctx.body ?? {}),
    });
    if (!moved) return status(404, "Application not found");
    return { data: moved };
  } catch (error) {
    return blocked(error);
  }
}
