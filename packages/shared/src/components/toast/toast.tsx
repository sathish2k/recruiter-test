"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import { useCallback, useState } from "react";
import { IconRenderer } from "../renderers/icon-renderer";

export interface ToastState {
  title: string;
  sub?: string;
}

export interface UseToastResult {
  toast: ToastState | null;
  show: (title: string, sub?: string) => void;
  clear: () => void;
}

export function useToast(): UseToastResult {
  const [toast, setToast] = useState<ToastState | null>(null);
  const show = useCallback((title: string, sub?: string) => setToast({ title, sub }), []);
  const clear = useCallback(() => setToast(null), []);
  return { toast, show, clear };
}

export function Toast({ toast, onClose }: { toast: ToastState | null; onClose: () => void }) {
  return (
    <Snackbar
      open={Boolean(toast)}
      onClose={onClose}
      autoHideDuration={3200}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "11px",
          bgcolor: "#1F1F1E",
          border: "1px solid rgba(78,168,116,.4)",
          borderRadius: "13px",
          p: "13px 16px",
          boxShadow: "0 18px 50px rgba(0,0,0,.6)",
          maxWidth: 380,
        }}
      >
        <IconRenderer name="check-circle" size={18} color="#8FD6AC" />
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{toast?.title}</Typography>
          {toast?.sub ? (
            <Typography sx={{ fontSize: 11.5, color: "text.secondary", mt: "1px" }}>
              {toast.sub}
            </Typography>
          ) : null}
        </Box>
        <IconButton onClick={onClose} sx={{ width: 22, height: 22, border: "none" }}>
          <IconRenderer name="close" size={15} />
        </IconButton>
      </Box>
    </Snackbar>
  );
}
