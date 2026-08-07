"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * The receipt for an action just taken, and its way back.
 *
 * Not a Toast. A toast reports something that happened *elsewhere* and stacks
 * top-right; a snackbar confirms what the recruiter just did, sits bottom-left
 * on the inverse surface, and shows one at a time. Optimistic writes depend on
 * it — without an undo there is nowhere for a mistaken write to go.
 */
export interface SnackbarAction {
  label: string;
  onClick: () => void;
}

export interface SnackbarState {
  id: number;
  message: string;
  /** "Undo" on a write, "Retry" on a failure. One control, never two. */
  action?: SnackbarAction;
  /** Holds the bar open with a spinner — a queued job reporting progress. */
  pending?: boolean;
}

export interface UseSnackbarResult {
  snackbar: SnackbarState | null;
  show: (message: string, action?: SnackbarAction, pending?: boolean) => void;
  clear: () => void;
}

let seq = 0;

/** Long enough to read a sentence and reach for undo, short enough to leave. */
const VISIBLE_MS = 5000;

interface SnackbarTrigger {
  show: (message: string, action?: SnackbarAction, pending?: boolean) => void;
  clear: () => void;
}

const SnackbarContext = createContext<SnackbarTrigger | null>(null);

/** Mount once at the app root, beside `ToastProvider`. */
export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null);
  const show = useCallback((message: string, action?: SnackbarAction, pending?: boolean) => {
    seq += 1;
    // One at a time: a newer receipt replaces the older one, because the
    // older action has already been superseded by this one.
    setSnackbar({ id: seq, message, action, pending });
  }, []);
  const clear = useCallback(() => setSnackbar(null), []);
  const value = useMemo<SnackbarTrigger>(() => ({ show, clear }), [show, clear]);
  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <Snackbar snackbar={snackbar} onClose={clear} />
    </SnackbarContext.Provider>
  );
}

/** Fire a snackbar from anywhere under `SnackbarProvider`. */
export function useSnackbar(): UseSnackbarResult {
  const trigger = useContext(SnackbarContext);
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null);
  const localShow = useCallback((message: string, action?: SnackbarAction, pending?: boolean) => {
    seq += 1;
    setSnackbar({ id: seq, message, action, pending });
  }, []);
  const localClear = useCallback(() => setSnackbar(null), []);
  if (trigger) return { snackbar: null, show: trigger.show, clear: trigger.clear };
  return { snackbar, show: localShow, clear: localClear };
}

export function Snackbar({
  snackbar,
  onClose,
}: {
  snackbar: SnackbarState | null;
  onClose: () => void;
}) {
  if (!snackbar) return null;
  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        position: "fixed",
        bottom: "24px",
        left: "24px",
        zIndex: (theme) => theme.zIndex.snackbar,
      }}
    >
      <SnackbarBar key={snackbar.id} snackbar={snackbar} onClose={onClose} />
    </Box>
  );
}

function SnackbarBar({ snackbar, onClose }: { snackbar: SnackbarState; onClose: () => void }) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    // A queued job holds the bar until the caller clears it.
    if (paused || snackbar.pending) return;
    const timer = setTimeout(onClose, VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [onClose, paused, snackbar.pending]);

  return (
    <Box
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        // The inverse surface is what separates a receipt from a notification.
        bgcolor: "surface.inverse",
        color: "surface.inverseFg",
        borderRadius: "8px",
        p: "10px 12px 10px 16px",
        minHeight: 44,
        maxWidth: 420,
        boxShadow: "var(--mui-palette-surface-menuShadow)",
      }}
    >
      {snackbar.pending ? (
        <CircularProgress
          size={15}
          thickness={5}
          sx={{ color: "surface.inverseFg", opacity: 0.7 }}
        />
      ) : null}
      <Box sx={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.5, flex: 1, minWidth: 0 }}>
        {snackbar.message}
      </Box>
      {snackbar.action ? (
        <Button
          size="small"
          onClick={() => {
            snackbar.action?.onClick();
            onClose();
          }}
          sx={{
            flex: "none",
            minHeight: 28,
            padding: "2px 10px",
            fontSize: 12.5,
            color: "surface.inverseFg",
            border: "1px solid",
            borderColor: "currentColor",
            opacity: 0.9,
            "&:hover": { opacity: 1, background: "transparent" },
          }}
        >
          {snackbar.action.label}
        </Button>
      ) : null}
    </Box>
  );
}
