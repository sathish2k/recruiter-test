"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { IconRenderer } from "../../renderers";
import type { WidgetProps } from "../types";

/**
 * A settings row: title (with an optional plan badge) and description on the
 * left, switch on the right, separated from the row above by a rule. Self-
 * labelling, so it doesn't use FieldShell.
 */
export function SwitchRowWidget({ prop, field, t }: WidgetProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        py: "13px",
        borderTop: "1px dashed",
        borderColor: "divider",
      }}
    >
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{t(prop.title ?? "")}</Typography>
          {prop.badge ? (
            <Chip
              variant="soft"
              size="small"
              icon={prop.badgeIcon ? <IconRenderer name={prop.badgeIcon} size={12} /> : undefined}
              label={t(prop.badge)}
            />
          ) : null}
        </Box>
        {prop.help ? (
          <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>{t(prop.help)}</Typography>
        ) : null}
      </Box>
      <Switch
        checked={!!field.value}
        onChange={(event) => field.onChange(event.target.checked)}
        sx={{ flex: "none" }}
      />
    </Box>
  );
}
