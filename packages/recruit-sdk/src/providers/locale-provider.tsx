"use client";

import { type ReactNode, useState } from "react";
import {
  I18nextProvider,
  useTranslation as useI18nextTranslation,
} from "react-i18next";
import { createI18n } from "./i18n";

export interface LocaleContextValue {
  language: string;
  setLanguage: (language: string) => void;
}

export function LocaleProvider({
  children,
  defaultLanguage = "en",
}: {
  children: ReactNode;
  defaultLanguage?: string;
}) {
  const [i18n] = useState(() => createI18n(defaultLanguage));
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

export function useLocale(): LocaleContextValue {
  const { i18n } = useI18nextTranslation();
  return {
    language: i18n.language,
    setLanguage: (language: string) => {
      i18n.changeLanguage(language);
    },
  };
}
