import type { AuthClaims } from "../plugins/auth-guard";
import {
  getScreening as getScreeningService,
  type ScreeningSettingsPatch,
  updateScreeningSettings as updateScreeningSettingsService,
} from "../services/screening.service";

export async function getScreening(ctx: { auth: AuthClaims }) {
  const data = await getScreeningService(ctx.auth.agencyId);
  return { data };
}

export async function putScreeningSettings(ctx: {
  auth: AuthClaims;
  body: ScreeningSettingsPatch;
}) {
  const settings = await updateScreeningSettingsService(
    ctx.auth.agencyId,
    ctx.body,
  );
  return { data: settings };
}
