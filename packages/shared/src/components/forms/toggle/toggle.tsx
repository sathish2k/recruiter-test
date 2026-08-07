"use client";

import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import type { WidgetProps } from "../types";

/** Switch or checkbox. Self-labelling, so it doesn't use FieldShell. */
export function ToggleWidget({ prop, field, t }: WidgetProps) {
  const Control = prop.widget === "checkbox" ? Checkbox : Switch;
  return (
    <Box>
      <FormControlLabel
        control={
          <Control
            checked={!!field.value}
            onChange={(event) => field.onChange(event.target.checked)}
          />
        }
        label={t(prop.title ?? "")}
      />
      {prop.help ? (
        <Typography sx={{ fontSize: 11, color: "text.disabled" }}>{t(prop.help)}</Typography>
      ) : null}
    </Box>
  );
}
