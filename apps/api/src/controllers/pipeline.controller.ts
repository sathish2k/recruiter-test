import { listRejectionReasons, listStages } from "../services/pipeline.service";

type Auth = { agencyId?: string | null };

/** The workspace's stages, in board order. Seeds the defaults on first read. */
export async function getStages(ctx: { user: Auth }) {
  const rows = await listStages(ctx.user.agencyId ?? "");
  return {
    data: rows.map((stage) => ({
      id: stage.id,
      name: stage.name,
      position: stage.position,
      clientVisible: stage.clientVisible,
      kind: stage.kind,
      slaDays: stage.slaDays,
    })),
  };
}

export async function getRejectionReasons(ctx: { user: Auth }) {
  const rows = await listRejectionReasons(ctx.user.agencyId ?? "");
  return {
    data: rows.map((reason) => ({
      id: reason.id,
      category: reason.category,
      label: reason.label,
      active: reason.active,
    })),
  };
}
