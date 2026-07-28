"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Radio from "@mui/material/Radio";
import Typography from "@mui/material/Typography";
import { type JsonSchema, Modal, type Translate } from "@recruit/shared";
import { useMemo, useState } from "react";

/** A candidate the duplicate check returned, with why it matched. */
export interface DuplicateMatch extends Record<string, unknown> {
  id: string;
  name: string;
  matchedOn?: string[];
}

/** One field the two records disagree on. */
interface Conflict {
  name: string;
  label: string;
  existing: string;
  incoming: string;
}

/** Widgets whose value is a file, a list or a remote id — nothing a
 * side-by-side comparison can render as one line. */
const NOT_COMPARABLE = new Set([
  "attachments",
  "generated-doc",
  "resumeAutofill",
  "repeater",
  "chips",
  "completeness",
  "facts",
  "callout",
  "heading",
]);

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

/**
 * Compares the form's values against the matched record field by field. Fields
 * only the form has are filled in silently; the ones where both sides hold a
 * different value are the choices the user makes.
 */
function compare(
  schema: JsonSchema | undefined,
  incoming: Record<string, unknown>,
  existing: Record<string, unknown>,
  t: Translate,
) {
  const conflicts: Conflict[] = [];
  const fills: Record<string, string> = {};

  for (const [name, prop] of Object.entries(schema?.properties ?? {})) {
    if (prop.type !== "string" || (prop.widget && NOT_COMPARABLE.has(prop.widget))) continue;
    const mine = text(incoming[name]);
    const theirs = text(existing[name]);
    if (!mine || mine === theirs) continue;
    if (!theirs) {
      fills[name] = mine;
      continue;
    }
    conflicts.push({ name, label: t(prop.title ?? name), existing: theirs, incoming: mine });
  }
  return { conflicts, fills };
}

export interface DuplicateMergeDialogProps {
  open: boolean;
  onClose: () => void;
  t: Translate;
  schema?: JsonSchema;
  /** The record being kept. */
  match: DuplicateMatch;
  /** The values in the form the user was filling. */
  incoming: Record<string, unknown>;
  /** Merged values, field by field. */
  onConfirm: (values: Record<string, string>) => void | Promise<void>;
  /** Offered only from a create: the reviewer decided it is a different person. */
  onCreateAnyway?: () => void | Promise<void>;
  createAnywayLabel?: string;
  busy?: boolean;
}

/**
 * The field-level merge (TC-CAN-002): every field the two records disagree on
 * is a two-way choice, and the kept values are written onto the record that
 * survives.
 */
export function DuplicateMergeDialog({
  open,
  onClose,
  t,
  schema,
  match,
  incoming,
  onConfirm,
  onCreateAnyway,
  createAnywayLabel,
  busy,
}: DuplicateMergeDialogProps) {
  const { conflicts, fills } = useMemo(
    () => compare(schema, incoming, match, t),
    [schema, incoming, match, t],
  );
  // Default to what is already on file — a merge should never quietly replace
  // a stored value with one the reviewer has not looked at.
  const [choices, setChoices] = useState<Record<string, "existing" | "incoming">>({});

  const confirm = () =>
    onConfirm({
      ...fills,
      ...Object.fromEntries(
        conflicts
          .filter((row) => choices[row.name] === "incoming")
          .map((row) => [row.name, row.incoming]),
      ),
    });

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={620}
      title={t("merge.title")}
      description={t("merge.body", { name: match.name })}
      footer={
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "8px", mt: "20px" }}>
          <Button variant="outlined" onClick={onClose} disabled={busy}>
            {t("actions.cancel")}
          </Button>
          {onCreateAnyway ? (
            <Button variant="outlined" onClick={onCreateAnyway} disabled={busy}>
              {createAnywayLabel}
            </Button>
          ) : null}
          <Button variant="contained" onClick={confirm} loading={busy}>
            {t("merge.confirm")}
          </Button>
        </Box>
      }
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {conflicts.length === 0 ? (
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            {t("merge.noConflicts")}
          </Typography>
        ) : (
          conflicts.map((row) => {
            const chosen = choices[row.name] ?? "existing";
            return (
              <Box
                key={row.name}
                data-merge-field={row.name}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "150px 1fr 1fr",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                  {row.label}
                </Typography>
                {(["existing", "incoming"] as const).map((side) => (
                  <Box
                    key={side}
                    onClick={() => setChoices((prev) => ({ ...prev, [row.name]: side }))}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      p: "6px 10px",
                      cursor: "pointer",
                      borderRadius: "10px",
                      border: "1px solid",
                      borderColor: chosen === side ? "surface.primarySoftBorder" : "divider",
                      bgcolor: chosen === side ? "surface.primarySoftBg" : "transparent",
                    }}
                  >
                    <Radio checked={chosen === side} size="small" sx={{ p: 0 }} />
                    <Typography sx={{ fontSize: 12.5, wordBreak: "break-word" }}>
                      {side === "existing" ? row.existing : row.incoming}
                    </Typography>
                  </Box>
                ))}
              </Box>
            );
          })
        )}

        {Object.keys(fills).length ? (
          <Typography sx={{ fontSize: 12, color: "text.disabled", mt: "6px" }}>
            {t("merge.fills", { count: String(Object.keys(fills).length) })}
          </Typography>
        ) : null}
      </Box>
    </Modal>
  );
}
