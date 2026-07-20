"use client";

import i18next, { type i18n as I18nInstance } from "i18next";
import { initReactI18next } from "react-i18next";

export type TranslationBundles = Map<string, Record<string, unknown>>;

const DEFAULT_LNG = "en";

// A dedicated i18next instance backing the engine's per-component translations.
// Each component's translation JSON is registered as a namespace (= component
// id); `fallback` is the default language, `[locale]` keys are other locales.
// Interpolation is left at i18next defaults (`{{ }}`), so the existing single-
// brace `{value}` placeholders that components replace manually are untouched.
export function createI18n(lng: string = DEFAULT_LNG): I18nInstance {
  const instance = i18next.createInstance();
  instance.use(initReactI18next).init({
    lng,
    fallbackLng: DEFAULT_LNG,
    ns: [],
    defaultNS: false,
    keySeparator: ".",
    // component ids contain dots — never treat a key as "ns:key".
    nsSeparator: false,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    resources: {},
  });
  return instance;
}

export function registerTranslations(instance: I18nInstance, bundles: TranslationBundles): void {
  bundles.forEach((data, componentId) => {
    if (!data || typeof data !== "object" || !componentId) return;
    const { fallback, ...locales } = data as {
      fallback?: Record<string, unknown>;
      [locale: string]: unknown;
    };
    if (fallback && typeof fallback === "object") {
      instance.addResourceBundle(DEFAULT_LNG, componentId, fallback, true, true);
    }
    for (const [lng, dict] of Object.entries(locales)) {
      if (dict && typeof dict === "object") {
        instance.addResourceBundle(lng, componentId, dict, true, true);
      }
    }
  });
}
