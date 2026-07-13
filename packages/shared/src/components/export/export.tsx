"use client";

import DescriptionRounded from "@mui/icons-material/DescriptionRounded";
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import FileDownloadOutlined from "@mui/icons-material/FileDownloadOutlined";
import PictureAsPdfRounded from "@mui/icons-material/PictureAsPdfRounded";
import TableViewRounded from "@mui/icons-material/TableViewRounded";
import Box from "@mui/material/Box";
import { useTranslation } from "@recruit/sdk";
import type { ReactNode } from "react";
import { useState } from "react";
import type { ExportConfig } from "./types";
import { useExport } from "./use-export";

type Row = Record<string, unknown>;

const ICONS: Record<string, ReactNode> = {
  pdf: <PictureAsPdfRounded sx={{ fontSize: 17, color: "#E89A9A" }} />,
  excel: <TableViewRounded sx={{ fontSize: 17, color: "#8FD6AC" }} />,
  word: <DescriptionRounded sx={{ fontSize: 17, color: "#9BB8D9" }} />,
  csv: <TableViewRounded sx={{ fontSize: 17, color: "#8FD6AC" }} />,
  json: <DescriptionRounded sx={{ fontSize: 17, color: "#9BB8D9" }} />,
};

// A config-driven export button styled like the Troy design: a pill with a
// chevron that opens an "EXPORT AS" menu of formats. Downloads via useExport
// (non-JSON formats fall back to CSV). Type labels resolve via useTranslation.
export function Export({
  id,
  config,
  data,
  filename = "export",
  label,
}: {
  id?: string;
  config?: ExportConfig;
  data: Row[];
  filename?: string;
  label?: string;
}) {
  const { t } = useTranslation(id ?? "");
  const { exportData } = useExport();
  const [open, setOpen] = useState(false);
  const types = config?.types ?? [{ label: "CSV", value: "csv", icon: "csv" }];

  const pick = (value: string) => {
    setOpen(false);
    exportData(value, data, filename);
  };

  return (
    <Box sx={{ position: "relative" }}>
      <Box
        onClick={() => setOpen((v) => !v)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          p: "9px 16px",
          borderRadius: "999px",
          border: "1px solid rgba(255,255,255,.14)",
          fontSize: 13,
          cursor: "pointer",
          "&:hover": { background: "rgba(255,255,255,.06)" },
        }}
      >
        <FileDownloadOutlined sx={{ fontSize: 16 }} />
        {label ? t(label) : t("export")}
        <ExpandMoreRounded sx={{ fontSize: 15, color: "#9A968E" }} />
      </Box>
      {open ? (
        <>
          <Box
            onClick={() => setOpen(false)}
            sx={{ position: "fixed", inset: 0, zIndex: 20 }}
          />
          <Box
            sx={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              zIndex: 30,
              width: 190,
              background: "#1F1F1E",
              border: "1px solid rgba(255,255,255,.12)",
              borderRadius: "12px",
              boxShadow: "0 18px 50px rgba(0,0,0,.6)",
              p: "6px",
            }}
          >
            <Box
              sx={{
                fontSize: 11,
                letterSpacing: ".08em",
                color: "#7C7972",
                p: "6px 11px 4px",
              }}
            >
              {t("exportAs")}
            </Box>
            {types.map((type) => (
              <Box
                key={type.value}
                onClick={() => pick(type.value)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  p: "9px 11px",
                  borderRadius: "8px",
                  fontSize: 13,
                  color: "#C9C5BD",
                  cursor: "pointer",
                  "&:hover": {
                    background: "rgba(255,255,255,.06)",
                    color: "#ECEAE7",
                  },
                }}
              >
                {type.icon ? ICONS[type.icon] : null}
                {id ? t(type.label) : type.label}
              </Box>
            ))}
          </Box>
        </>
      ) : null}
    </Box>
  );
}
