import { headers } from "next/headers";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface BootLocale {
  language?: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: string;
}

/**
 * Reads the signed-in user's effective locale preferences server-side (their
 * override, else the workspace default) by forwarding the request cookies to
 * the API — so the first paint on any device already formats correctly, with no
 * client boot fetch. Returns `{}` when unauthenticated or on any error.
 */
export async function getBootLocale(): Promise<BootLocale> {
  const cookie = (await headers()).get("cookie");
  if (!cookie) return {};
  try {
    const res = await fetch(`${API_URL}/profile`, { headers: { cookie }, cache: "no-store" });
    if (!res.ok) return {};
    const profile = (await res.json()) as {
      timezone?: string;
      preferences?: BootLocale;
      workspace?: { defaults?: BootLocale } | null;
    };
    const overrides = profile.preferences ?? {};
    const defaults = profile.workspace?.defaults ?? {};
    return {
      language: overrides.language ?? defaults.language,
      timezone: profile.timezone || undefined,
      dateFormat: overrides.dateFormat ?? defaults.dateFormat,
      timeFormat: overrides.timeFormat ?? defaults.timeFormat,
    };
  } catch {
    return {};
  }
}
