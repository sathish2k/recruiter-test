"use client";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, useColorScheme } from "@mui/material/styles";
import { createContext, type ReactNode, useContext, useMemo } from "react";
import { type ThemeMode, theme } from "./theme";

interface ColorModeContextValue {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ColorModeContext = createContext<ColorModeContextValue | null>(null);

export function useColorMode(): ColorModeContextValue {
  const ctx = useContext(ColorModeContext);
  if (!ctx) {
    throw new Error("useColorMode must be used within a ThemeModeProvider");
  }
  return ctx;
}

/**
 * Adapts MUI's `useColorScheme` to the `useColorMode` shape the app already
 * consumes. MUI owns persistence and the `data-theme` attribute now, so there's
 * no localStorage handling or theme-object swapping here.
 */
function ColorModeBridge({ children }: { children: ReactNode }) {
  const { mode, systemMode, setMode } = useColorScheme();
  // `mode` is undefined until MUI has read storage; "system" resolves via systemMode.
  const resolved: ThemeMode = (mode === "system" ? systemMode : mode) ?? "dark";

  const value = useMemo<ColorModeContextValue>(
    () => ({
      mode: resolved,
      setMode: (next: ThemeMode) => setMode(next),
      toggle: () => setMode(resolved === "dark" ? "light" : "dark"),
    }),
    [resolved, setMode],
  );

  return <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>;
}

/**
 * One theme carrying both colour schemes. Switching modes flips the
 * `data-theme` attribute on <html>; the browser re-resolves the CSS variables,
 * so nothing re-renders and there's no flash before hydration — see
 * `InitColorSchemeScript` in the web app's layout.
 */
export function ThemeModeProvider({ children }: { children: ReactNode }) {
  return (
    // `modeStorageKey` keeps the key the previous implementation used, so an
    // existing stored preference survives the switch to MUI-managed persistence.
    <ThemeProvider theme={theme} defaultMode="dark" modeStorageKey="recruit-theme">
      <CssBaseline />
      <ColorModeBridge>{children}</ColorModeBridge>
    </ThemeProvider>
  );
}
