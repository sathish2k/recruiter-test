"use client";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import { useFormContext } from "react-hook-form";
import { FactRows } from "../../detail/fact-rows";
import type { WidgetProps } from "../types";

/**
 * Display-only provenance rows at the foot of a card — the design's
 * "Created by / Created / Last activity" on the candidate rail. Reads live form
 * values, so a record that is not saved yet can still say what happens on save.
 */
export function FactsWidget({ prop, t }: WidgetProps) {
  const { getValues } = useFormContext();
  const facts = prop.facts ?? [];
  if (!facts.length) return null;
  return (
    <Box>
      <Divider sx={{ mb: "10px" }} />
      <FactRows
        fields={facts.map((fact) => ({ key: fact.path, label: fact.label, path: fact.path }))}
        data={getValues() as Record<string, unknown>}
        t={t}
        size="inset"
      />
    </Box>
  );
}
