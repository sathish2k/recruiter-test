"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useTranslation } from "@recruit/sdk";
import { useState } from "react";
import { IconRenderer } from "../renderers";
import type { ExportConfig } from "./types";
import { useExport } from "./use-export";

type Row = Record<string, unknown>;

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
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const types = config?.types ?? [{ label: "CSV", value: "csv", icon: "csv" }];

  const pick = (value: string) => {
    setAnchor(null);
    exportData(value, data, filename);
  };

  return (
    <>
      <Button
        variant="outlined"
        onClick={(e) => setAnchor(e.currentTarget)}
        startIcon={<IconRenderer name="download" size={16} />}
        endIcon={<IconRenderer name="expand-more" size={15} color="#9A968E" />}
        sx={{ fontWeight: 400 }}
      >
        {label ? t(label) : t("export")}
      </Button>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { mt: "8px", width: 190 } } }}
      >
        <Box
          sx={{
            fontSize: 11,
            letterSpacing: ".08em",
            color: "text.disabled",
            p: "6px 11px 4px",
          }}
        >
          {t("exportAs")}
        </Box>
        {types.map((type) => (
          <MenuItem key={type.value} onClick={() => pick(type.value)}>
            {type.icon ? (
              <IconRenderer name={type.icon} size={17} color={type.color} />
            ) : null}
            {id ? t(type.label) : type.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
