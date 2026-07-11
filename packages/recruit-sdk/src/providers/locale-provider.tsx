"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";

export interface LocaleContextValue {
  language: string;
  setLanguage: (language: string) => void;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export function LocaleProvider({
  children,
  defaultLanguage = "en",
}: {
  children: ReactNode;
  defaultLanguage?: string;
}) {
  const [language, setLanguage] = useState(defaultLanguage);
  const value = useMemo(() => ({ language, setLanguage }), [language]);
  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext) ?? { language: "en", setLanguage: () => {} };
}
