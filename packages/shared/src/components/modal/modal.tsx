"use client";

import CloseRounded from "@mui/icons-material/CloseRounded";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  width?: number | string;
}

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
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: { background: "rgba(0,0,0,.6)", backdropFilter: "blur(4px)" },
        },
        paper: { sx: { width, maxWidth: "100%", m: 2, p: "26px 28px" } },
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
        {title ? <Typography sx={{ fontSize: 17, fontWeight: 700 }}>{title}</Typography> : <span />}
        <IconButton onClick={onClose} sx={{ width: 28, height: 28 }}>
          <CloseRounded sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>
      {description ? (
        <Typography sx={{ fontSize: 12.5, color: "text.secondary", mb: "18px" }}>
          {description}
        </Typography>
      ) : null}
      {children}
      {footer}
    </Dialog>
  );
}
