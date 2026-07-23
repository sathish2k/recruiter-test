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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {prop.title && !prop.hideLabel ? (
        <Typography sx={{ fontSize: 14.5, fontWeight: 700 }}>{t(prop.title)}</Typography>
      ) : null}
      {fields.map((row, index) => (
        <Card
          key={row.id}
          variant="base"
          sx={{ p: "16px", position: "relative", display: "flex", flexDirection: "column" }}
        >
          <IconButton
            aria-label={t("form.remove", "Remove")}
            onClick={() => remove(index)}
            size="small"
            sx={{ position: "absolute", top: 8, right: 8, color: "text.disabled" }}
          >
            <IconRenderer name="close" size={16} />
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
      ))}
      <Button
        variant="outlined"
        onClick={() => append(blank)}
        startIcon={<IconRenderer name="add" size={16} />}
        sx={{ alignSelf: "flex-start", fontWeight: 400 }}
      >
        {t(prop.addLabel ?? "form.add", "Add")}
      </Button>
    </Box>
  );
}
