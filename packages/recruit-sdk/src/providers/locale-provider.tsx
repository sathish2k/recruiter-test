"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { I18nextProvider, useTranslation as useI18nextTranslation } from "react-i18next";
import { createI18n } from "./i18n";

const STORAGE_KEY = "recruit-locale";

/** Client-side locale preferences, persisted in localStorage (like the theme
 * mode) — the single source read across the portal via `useLocale`. */
export interface LocalePreferences {
  language?: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: string;
}

export interface LocaleContextValue {
  language: string;
  setLanguage: (language: string) => void;
  timezone?: string;
  setTimezone: (timezone: string) => void;
  dateFormat?: string;
  setDateFormat: (dateFormat: string) => void;
  timeFormat?: string;
  setTimeFormat: (timeFormat: string) => void;
}

function readStored(): LocalePreferences {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as LocalePreferences;
  } catch {
    return {};
  }
}

function writeStored(prefs: LocalePreferences) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Storage unavailable (private mode / quota) — stay in-memory for the session.
  }
}

interface LocalePrefsCtx {
  prefs: LocalePreferences;
  update: (patch: LocalePreferences) => void;
}

const LocalePrefsContext = createContext<LocalePrefsCtx | null>(null);

export function LocaleProvider({
  children,
  defaultLanguage = "en",
  initialPreferences,
}: {
  children: ReactNode;
  defaultLanguage?: string;
  /** Server-fetched preferences (Next.js layout) — authoritative on boot so the
   * first paint is correct on any device. Falls back to localStorage only when
   * the server provided nothing (e.g. signed out). */
  initialPreferences?: LocalePreferences;
}) {
  const hasServer = !!initialPreferences && Object.keys(initialPreferences).length > 0;
  // Deterministic init (same on server + client) so hydration matches.
  const [prefs, setPrefs] = useState<LocalePreferences>(() => initialPreferences ?? {});
  const [i18n] = useState(() => createI18n(initialPreferences?.language ?? defaultLanguage));

  // Client-only: when the server gave nothing, hydrate from the cached store
  // after mount (never during render, so it can't cause a hydration mismatch).
  useEffect(() => {
    if (hasServer) return;
    const stored = readStored();
    if (Object.keys(stored).length === 0) return;
    setPrefs(stored);
    if (stored.language) i18n.changeLanguage(stored.language);
  }, [hasServer, i18n]);

  const update = useCallback((patch: LocalePreferences) => {
    setPrefs((prev) => {
      // Same values → same reference, so consumers that re-mirror into this
      // store (e.g. the account screen) can't drive a render loop.
      const changed = (Object.keys(patch) as (keyof LocalePreferences)[]).some(
        (key) => prev[key] !== patch[key],
      );
      if (!changed) return prev;
      const next = { ...prev, ...patch };
      writeStored(next);
      return next;
    });
  }, []);

  const value = useMemo<LocalePrefsCtx>(() => ({ prefs, update }), [prefs, update]);

  return (
    <I18nextProvider i18n={i18n}>
      <LocalePrefsContext.Provider value={value}>{children}</LocalePrefsContext.Provider>
    </I18nextProvider>
  );
}

const EMPTY_PREFS: LocalePreferences = {};
const NOOP_UPDATE = (_patch: LocalePreferences) => {};

export function useLocale(): LocaleContextValue {
  const { i18n } = useI18nextTranslation();
  const ctx = useContext(LocalePrefsContext);
  const prefs = ctx?.prefs ?? EMPTY_PREFS;
  const update = ctx?.update ?? NOOP_UPDATE;
  const language = i18n.language;
  // Memoized so the returned setters are stable references — safe to use as
  // effect dependencies in consumers.
  return useMemo<LocaleContextValue>(
    () => ({
      language,
      setLanguage: (next: string) => {
        i18n.changeLanguage(next);
        update({ language: next });
      },
      timezone: prefs.timezone,
      setTimezone: (timezone: string) => update({ timezone }),
      dateFormat: prefs.dateFormat,
      setDateFormat: (dateFormat: string) => update({ dateFormat }),
      timeFormat: prefs.timeFormat,
      setTimeFormat: (timeFormat: string) => update({ timeFormat }),
    }),
    [i18n, language, prefs, update],
  );
}
