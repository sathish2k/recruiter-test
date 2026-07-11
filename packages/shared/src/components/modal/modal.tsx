"use client";

import CloseRounded from "@mui/icons-material/CloseRounded";
import Box from "@mui/material/Box";
import MuiModal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Optional footer (actions). FormModal supplies its own via FormRenderer. */
  footer?: ReactNode;
  width?: number | string;
}

// A centered, dark-themed modal shell matching the Troy design. Built on MUI
// Modal (backdrop, focus trap, ESC-to-close, portal) with a styled card.
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = 420,
}: ModalProps) {
  return (
    <MuiModal
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: {
            background: "rgba(0,0,0,.6)",
            backdropFilter: "blur(4px)",
          },
        },
      }}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Box
        sx={{
          width,
          maxWidth: "100%",
          background: "#1C1C1B",
          border: "1px solid rgba(255,255,255,.1)",
          borderRadius: "20px",
          p: "26px 28px",
          boxShadow: "0 30px 80px rgba(0,0,0,.6)",
          color: "#ECEAE7",
          outline: "none",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            mb: title ? "4px" : 0,
          }}
        >
          {title ? (
            <Typography sx={{ fontSize: 17, fontWeight: 700 }}>
              {title}
            </Typography>
          ) : (
            <span />
          )}
          <Box
            onClick={onClose}
            sx={{
              width: 28,
              height: 28,
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,.14)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9A968E",
              cursor: "pointer",
              flex: "none",
              "&:hover": {
                background: "rgba(255,255,255,.06)",
                color: "#ECEAE7",
              },
            }}
          >
            <CloseRounded sx={{ fontSize: 14 }} />
          </Box>
        </Box>
        {description ? (
          <Typography sx={{ fontSize: 12.5, color: "#9A968E", mb: "18px" }}>
            {description}
          </Typography>
        ) : null}
        {children}
        {footer}
      </Box>
    </MuiModal>
  );
}
