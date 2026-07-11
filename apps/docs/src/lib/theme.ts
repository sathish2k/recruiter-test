"use client";

import { createTheme } from "@mui/material/styles";

export const docsTheme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    primary: { main: "#4f46e5" },
    secondary: { main: "#0ea5e9" },
    background: { default: "#ffffff", paper: "#ffffff" },
    text: { primary: "#1b1830", secondary: "#5b5872" },
    divider: "#e6e2f3",
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily:
      'ui-sans-serif, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h1: { fontSize: "2.25rem", fontWeight: 800, letterSpacing: "-0.02em" },
    h2: { fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.01em" },
    h3: { fontSize: "1.15rem", fontWeight: 700 },
    body1: { lineHeight: 1.7 },
  },
});

export const MONO =
  'ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace';

export const DRAWER_WIDTH = 264;
export const TOC_WIDTH = 220;
