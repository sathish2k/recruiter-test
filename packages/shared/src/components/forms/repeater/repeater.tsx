"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { type FieldValues, useFieldArray, useFormContext } from "react-hook-form";
import { IconRenderer } from "../../renderers";
import { Field } from "../field/field";
import { FormContainer } from "../form-container";
import type { WidgetProps } from "../types";

/**
 * An add/remove list of sub-records. Each row renders the fields declared in
 * `prop.itemSchema` bound to `<name>.<index>.<key>`, so the stored value is an
 * array of objects. Uses `useFieldArray` off the form context the sections
 * renderer provides.
 */
export function RepeaterWidget({ name, prop, t }: WidgetProps) {
  const { control } = useFormContext<FieldValues>();
  const { fields, append, remove } = useFieldArray({ control, name });
  const itemSchema = prop.itemSchema ?? {};
  const entries = Object.entries(itemSchema);
  const blank = Object.fromEntries(
    entries.map(([key, p]) => [key, p.type === "boolean" ? false : ""]),
  );

  const addButton = (
    <Button
      variant="outlined"
      size="small"
      onClick={() => append(blank)}
      startIcon={<IconRenderer name="add" size={16} />}
      sx={{
        flex: "none",
        fontWeight: 600,
        color: "surface.primarySoftFg",
        borderColor: "surface.primarySoftBorder",
        bgcolor: "surface.primarySoftBg",
        "&:hover": {
          borderColor: "surface.primarySoftBorder",
          bgcolor: "surface.primarySoftBg",
          filter: "brightness(1.12)",
        },
      }}
    >
      {t(prop.addLabel ?? "form.add", "Add")}
    </Button>
  );

  return (
    <Card
      variant="base"
      sx={{ p: "20px 22px", display: "flex", flexDirection: "column", gap: "16px" }}
    >
      {/* Header: title on the left, the add CTA pinned top-right (per design). */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        {prop.title && !prop.hideLabel ? (
          <Typography sx={{ fontSize: 14.5, fontWeight: 700 }}>{t(prop.title)}</Typography>
        ) : (
          <Box />
        )}
        {addButton}
      </Box>
      {fields.map((row, index) => (
        <Box key={row.id} sx={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
          {/* Row index badge, like the design. */}
          <Box
            sx={{
              flex: "none",
              width: 24,
              height: 24,
              mt: "14px",
              borderRadius: "999px",
              border: "1px solid",
              borderColor: "surface.primarySoftBorder",
              color: "surface.accentBright",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11.5,
              fontWeight: 700,
            }}
          >
            {index + 1}
          </Box>
          <Card variant="base" sx={{ p: "16px", position: "relative", flex: 1, minWidth: 0 }}>
            <IconButton
              aria-label={t("form.remove", "Remove")}
              onClick={() => remove(index)}
              size="small"
              sx={{ position: "absolute", top: 8, right: 8, color: "text.disabled" }}
            >
              <IconRenderer name="delete" size={16} />
            </IconButton>
            <FormContainer
              gridContainer={{ columns: 12, spacing: 2 }}
              grids={entries.map(([, p]) => p.grid)}
            >
              {entries.map(([key, itemProp]) => (
                <Field
                  key={key}
                  name={`${name}.${index}.${key}`}
                  prop={itemProp}
                  control={control}
                  t={t}
                />
              ))}
            </FormContainer>
          </Card>
        </Box>
      ))}
    </Card>
  );
}
