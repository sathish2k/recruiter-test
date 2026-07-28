"use client";

import Box from "@mui/material/Box";
import GlobalStyles from "@mui/material/GlobalStyles";
import { keyframes } from "@mui/material/styles";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ToastKind = "success" | "warning" | "error";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastState {
  /** Bumps per show so the card remounts and replays its animations. */
  id: number;
  title: string;
  sub?: string;
  kind: ToastKind;
  /** One inline control — the board's "Undo" on a stage move. */
  action?: ToastAction;
}

export interface UseToastResult {
  toast: ToastState | null;
  show: (title: string, sub?: string, kind?: ToastKind, action?: ToastAction) => void;
  clear: () => void;
}

let seq = 0;

interface ToastTrigger {
  show: (title: string, sub?: string, kind?: ToastKind, action?: ToastAction) => void;
  clear: () => void;
}

const ToastContext = createContext<ToastTrigger | null>(null);

/**
 * Mount once at the app root: renders the single `Toast` and lets any component
 * fire it via `useToast().show(...)`. No per-screen `<Toast>` needed.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const show = useCallback(
    (title: string, sub?: string, kind: ToastKind = "success", action?: ToastAction) => {
      seq += 1;
      setToast({ id: seq, title, sub, kind, action });
    },
    [],
  );
  const clear = useCallback(() => setToast(null), []);
  const value = useMemo<ToastTrigger>(() => ({ show, clear }), [show, clear]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast toast={toast} onClose={clear} />
    </ToastContext.Provider>
  );
}

/**
 * Fire toasts from anywhere. With a `ToastProvider` above (the app root) it
 * routes to the single root toast — `toast` stays `null`, so a stray local
 * `<Toast toast={toast} />` renders nothing. Without a provider it falls back to
 * local state, so the component can still render its own `<Toast>`.
 */
export function useToast(): UseToastResult {
  const trigger = useContext(ToastContext);
  const [toast, setToast] = useState<ToastState | null>(null);
  const localShow = useCallback(
    (title: string, sub?: string, kind: ToastKind = "success", action?: ToastAction) => {
      seq += 1;
      setToast({ id: seq, title, sub, kind, action });
    },
    [],
  );
  const localClear = useCallback(() => setToast(null), []);
  if (trigger) return { toast: null, show: trigger.show, clear: trigger.clear };
  return { toast, show: localShow, clear: localClear };
}

const RING_R = 16.5;
const RING_C = 2 * Math.PI * RING_R;
const VISIBLE_MS = 2600;

// The "orbit" toast: a 3D flip-in card, a self-drawing glyph, an orbiting
// satellite dot and a conic-style countdown ring that drains over its lifetime.
const flip = keyframes`0%{transform:perspective(700px) rotateX(-72deg) translateY(-6px);opacity:0}55%{transform:perspective(700px) rotateX(7deg);opacity:1}80%{transform:perspective(700px) rotateX(-3deg)}100%{transform:perspective(700px) rotateX(0)}`;
const rise = keyframes`0%{transform:translateY(9px);opacity:0;filter:blur(3px)}100%{transform:translateY(0);opacity:1;filter:blur(0)}`;
const orbit = keyframes`0%{transform:rotate(0deg) translateX(21px) rotate(0deg);opacity:1}85%{opacity:1}100%{transform:rotate(390deg) translateX(21px) rotate(-390deg);opacity:0}`;

// The SVG ring/glyph animate via named @keyframes injected globally: emotion
// only inserts `keyframes` used inside sx/css, not ones referenced from a plain
// inline `style`, so these have to be real global rules to run at all.
const svgKeyframes = {
  "@keyframes toastGlyphDraw": { from: { strokeDashoffset: 24 }, to: { strokeDashoffset: 0 } },
  "@keyframes toastRingDrain": { from: { strokeDashoffset: 0 }, to: { strokeDashoffset: RING_C } },
};

const KIND: Record<ToastKind, { main: string; fg: string; path: string }> = {
  success: {
    main: "var(--mui-palette-success-main)",
    fg: "var(--mui-palette-success-light)",
    path: "M2.5 8.5 L6.5 12.5 L13.5 4",
  },
  warning: {
    main: "var(--mui-palette-warning-main)",
    fg: "var(--mui-palette-warning-light)",
    path: "M8 3.5 L8 9.8 M8 12.8 L8 12.9",
  },
  error: {
    main: "var(--mui-palette-error-main)",
    fg: "var(--mui-palette-error-light)",
    path: "M4.5 4.5 L11.5 11.5 M11.5 4.5 L4.5 11.5",
  },
};

export function Toast({ toast, onClose }: { toast: ToastState | null; onClose: () => void }) {
  return (
    <Box
      sx={{
        position: "fixed",
        top: "20px",
        right: "26px",
        zIndex: 9990,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {toast ? <ToastCard key={toast.id} toast={toast} onClose={onClose} /> : null}
    </Box>
  );
}

function ToastCard({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  const kind = KIND[toast.kind] ?? KIND.success;
  const soft = `color-mix(in srgb, ${kind.main} 16%, transparent)`;

  useEffect(() => {
    const timer = setTimeout(onClose, VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <Box
      onClick={onClose}
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: "13px",
        bgcolor: "surface.elevated",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "18px",
        p: "12px 20px 12px 12px",
        maxWidth: 400,
        transformOrigin: "top center",
        animation: `${flip} .6s cubic-bezier(.3,1.3,.4,1)`,
        boxShadow: `0 20px 55px var(--mui-palette-surface-backdrop), 0 0 26px color-mix(in srgb, ${kind.main} 26%, transparent)`,
        cursor: "pointer",
      }}
    >
      <GlobalStyles styles={svgKeyframes} />
      <Box sx={{ position: "relative", width: 38, height: 38, flex: "none" }}>
        <svg
          viewBox="0 0 38 38"
          style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}
          aria-hidden="true"
        >
          <circle
            cx="19"
            cy="19"
            r={RING_R}
            fill="none"
            stroke={kind.main}
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{
              strokeDasharray: RING_C,
              strokeDashoffset: 0,
              animation: "toastRingDrain 2.6s linear forwards",
            }}
          />
        </svg>
        <Box
          sx={{
            position: "absolute",
            inset: "5px",
            borderRadius: "999px",
            bgcolor: soft,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d={kind.path}
              stroke={kind.fg}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 24,
                strokeDashoffset: 0,
                animation: "toastGlyphDraw .5s ease-out both",
              }}
            />
          </svg>
        </Box>
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 5,
            height: 5,
            mt: "-2.5px",
            ml: "-2.5px",
            borderRadius: "999px",
            bgcolor: kind.fg,
            boxShadow: `0 0 8px color-mix(in srgb, ${kind.main} 90%, transparent)`,
            animation: `${orbit} .85s cubic-bezier(.4,0,.3,1) .1s both`,
          }}
        />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Box
          sx={{
            fontSize: 13,
            fontWeight: 700,
            color: "text.primary",
            whiteSpace: "nowrap",
            animation: `${rise} .4s ease-out .14s both`,
          }}
        >
          {toast.title}
        </Box>
        {toast.sub ? (
          <Box
            sx={{
              fontSize: 11.5,
              color: "text.secondary",
              mt: "1px",
              whiteSpace: "nowrap",
              animation: `${rise} .4s ease-out .24s both`,
            }}
          >
            {toast.sub}
          </Box>
        ) : null}
      </Box>
      {toast.action ? (
        <Box
          component="button"
          type="button"
          onClick={() => {
            toast.action?.onClick();
            onClose();
          }}
          sx={{
            flex: "none",
            ml: "4px",
            px: "10px",
            py: "5px",
            borderRadius: "8px",
            border: 0,
            background: "none",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "inherit",
            color: "surface.primarySoftFg",
            "&:hover": { bgcolor: "surface.primarySoftBg" },
          }}
        >
          {toast.action.label}
        </Box>
      ) : null}
    </Box>
  );
}
