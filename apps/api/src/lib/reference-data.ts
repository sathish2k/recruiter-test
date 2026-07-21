import { getCountries, getCountryCallingCode } from "libphonenumber-js";

/**
 * Reference lists the UI needs but shouldn't hardcode. Both are derived at
 * runtime — timezones from the ICU database the runtime already ships, dial
 * codes from libphonenumber-js — so they stay correct without us maintaining a
 * table. Computed once per process.
 */

export interface TimezoneOption {
  /** IANA id, e.g. `Asia/Kolkata` — what gets stored. */
  value: string;
  /** `(GMT+5:30) Asia/Kolkata` — what the picker shows. */
  label: string;
  /** Minutes east of UTC, used for sorting. */
  offsetMinutes: number;
}

export interface CurrencyOption {
  /** ISO 4217 code, e.g. `INR` — what gets stored. */
  value: string;
  /** `₹ INR — Indian Rupee`. */
  label: string;
  symbol: string;
}

export interface LanguageOption {
  /** ISO 639-1 code, e.g. `en` — what gets stored. */
  value: string;
  /** `English` / `Deutsch` — the name in its own language. */
  label: string;
  /** The English name, for searching. */
  english: string;
}

export interface DialCodeOption {
  iso: string;
  code: string;
  country: string;
}

/** Current UTC offset for a zone, in minutes. Uses the `longOffset` name
 * (`GMT+05:30`) rather than arithmetic on dates, so DST is handled for us. */
function offsetMinutesFor(timeZone: string, now: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "longOffset",
  }).formatToParts(now);
  const name = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT";
  const match = /GMT([+-])(\d{2}):(\d{2})/.exec(name);
  if (!match) return 0;
  const [, sign, hours, minutes] = match;
  const total = Number(hours) * 60 + Number(minutes);
  return sign === "-" ? -total : total;
}

function formatOffset(minutes: number): string {
  const sign = minutes < 0 ? "-" : "+";
  const abs = Math.abs(minutes);
  return `GMT${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
}

let timezoneCache: TimezoneOption[] | null = null;

export function listTimezones(): TimezoneOption[] {
  if (timezoneCache) return timezoneCache;
  const now = new Date();
  const zones = Intl.supportedValuesOf("timeZone");
  timezoneCache = zones
    .map((value) => {
      const offsetMinutes = offsetMinutesFor(value, now);
      return { value, offsetMinutes, label: `(${formatOffset(offsetMinutes)}) ${value}` };
    })
    .sort((a, b) => a.offsetMinutes - b.offsetMinutes || a.value.localeCompare(b.value));
  return timezoneCache;
}

/**
 * IANA renamed several zones; ICU adopts the new spelling on its own schedule,
 * so a stored `Asia/Kolkata` can be absent from a runtime that still says
 * `Asia/Calcutta` (and vice versa). Resolving through this keeps a stored value
 * selectable instead of rendering an empty picker.
 */
const ZONE_ALIASES: Record<string, string> = {
  "Asia/Kolkata": "Asia/Calcutta",
  "Asia/Calcutta": "Asia/Kolkata",
  "Europe/Kyiv": "Europe/Kiev",
  "Europe/Kiev": "Europe/Kyiv",
  "Asia/Ho_Chi_Minh": "Asia/Saigon",
  "Asia/Saigon": "Asia/Ho_Chi_Minh",
  "America/Argentina/Buenos_Aires": "America/Buenos_Aires",
  "America/Buenos_Aires": "America/Argentina/Buenos_Aires",
};

/**
 * Maps a zone id onto whatever spelling this runtime actually supports.
 * `fallback` covers values that aren't zone ids at all — early rows stored a
 * display string like `IST (GMT+5:30)` — so those land on the workspace default
 * rather than an arbitrary zone.
 */
export function resolveTimezone(preferred: string, fallback = "UTC"): string {
  const zones = listTimezones();
  const has = (value: string) => zones.some((z) => z.value === value);

  if (has(preferred)) return preferred;

  const alias = ZONE_ALIASES[preferred];
  if (alias && has(alias)) return alias;

  // A real zone id the runtime spells differently: match on current offset.
  try {
    const offset = offsetMinutesFor(preferred, new Date());
    const sameOffset = zones.find((z) => z.offsetMinutes === offset);
    if (sameOffset) return sameOffset.value;
  } catch {
    // Not a zone id at all — use the caller's fallback below.
  }

  if (has(fallback)) return fallback;
  const aliasedFallback = ZONE_ALIASES[fallback];
  if (aliasedFallback && has(aliasedFallback)) return aliasedFallback;
  return has("UTC") ? "UTC" : (zones[0]?.value ?? "UTC");
}

let dialCodeCache: DialCodeOption[] | null = null;

export function listDialCodes(): DialCodeOption[] {
  if (dialCodeCache) return dialCodeCache;
  const names = new Intl.DisplayNames(["en"], { type: "region" });
  dialCodeCache = getCountries()
    .map((iso) => ({
      iso,
      code: `+${getCountryCallingCode(iso)}`,
      country: names.of(iso) ?? iso,
    }))
    .sort((a, b) => a.country.localeCompare(b.country));
  return dialCodeCache;
}

// ── Currencies ────────────────────────────────────────────────────────────────

let currencyCache: CurrencyOption[] | null = null;

export function listCurrencies(): CurrencyOption[] {
  if (currencyCache) return currencyCache;
  const names = new Intl.DisplayNames(["en"], { type: "currency" });
  currencyCache = Intl.supportedValuesOf("currency")
    .map((value) => {
      const symbol =
        Intl.NumberFormat("en", { style: "currency", currency: value })
          .formatToParts(0)
          .find((part) => part.type === "currency")?.value ?? value;
      const name = names.of(value) ?? value;
      return { value, symbol, label: `${symbol} ${value} — ${name}` };
    })
    .sort((a, b) => a.value.localeCompare(b.value));
  return currencyCache;
}

// ── Languages ─────────────────────────────────────────────────────────────────

let languageCache: LanguageOption[] | null = null;

/**
 * ISO 639-1 codes ICU actually recognises, discovered by asking DisplayNames
 * about every two-letter combination with `fallback: "none"` — a code it
 * doesn't know returns undefined. Keeps the list tied to the runtime's own data
 * instead of a table we'd have to maintain.
 */
export function listLanguages(): LanguageOption[] {
  if (languageCache) return languageCache;
  const english = new Intl.DisplayNames(["en"], { type: "language", fallback: "none" });
  const options: LanguageOption[] = [];
  for (let a = 97; a < 123; a++) {
    for (let b = 97; b < 123; b++) {
      const value = String.fromCharCode(a, b);
      const englishName = english.of(value);
      if (!englishName) continue;
      let native = englishName;
      try {
        native = new Intl.DisplayNames([value], { type: "language" }).of(value) ?? englishName;
      } catch {
        // Locale not usable for display — keep the English name.
      }
      options.push({ value, label: native, english: englishName });
    }
  }
  languageCache = options.sort((a, b) => a.english.localeCompare(b.english));
  return languageCache;
}

// ── Legacy value resolution ───────────────────────────────────────────────────

/** Early rows stored display strings like `₹ INR — Indian Rupee`; pull the ISO
 * code back out so the picker can select it. */
export function resolveCurrency(stored: string, fallback = "USD"): string {
  const codes = new Set(listCurrencies().map((c) => c.value));
  if (codes.has(stored)) return stored;
  const embedded = /\b([A-Z]{3})\b/.exec(stored ?? "")?.[1];
  if (embedded && codes.has(embedded)) return embedded;
  return codes.has(fallback) ? fallback : "USD";
}

/** Same for languages, which were stored as `English (India)`. */
export function resolveLanguage(stored: string, fallback = "en"): string {
  const options = listLanguages();
  if (options.some((l) => l.value === stored)) return stored;
  const lower = (stored ?? "").toLowerCase();
  // `en-IN`, `en_IN` → `en`
  const prefix = lower.split(/[-_]/)[0];
  if (prefix && options.some((l) => l.value === prefix)) return prefix;
  // `English (India)` → match on the English name.
  const byName = options.find((l) => lower.startsWith(l.english.toLowerCase()));
  if (byName) return byName.value;
  return options.some((l) => l.value === fallback) ? fallback : "en";
}
