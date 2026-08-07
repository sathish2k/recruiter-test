"use client";

import AddRounded from "@mui/icons-material/AddRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import KeyboardArrowDownRounded from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowUpRounded from "@mui/icons-material/KeyboardArrowUpRounded";
import LockRounded from "@mui/icons-material/LockRounded";
import PersonAddRounded from "@mui/icons-material/PersonAddRounded";
import UnfoldMoreRounded from "@mui/icons-material/UnfoldMoreRounded";
import VisibilityOffRounded from "@mui/icons-material/VisibilityOffRounded";
import VisibilityRounded from "@mui/icons-material/VisibilityRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import InputBase from "@mui/material/InputBase";
import Typography from "@mui/material/Typography";
import { useWatch } from "react-hook-form";
import { FieldShell } from "../forms/field/field-shell";
import type { WidgetProps, Widgets } from "../forms/types";

/**
 * The setup wizard's own field widgets, handed to FormRenderer through its
 * `widgets` map rather than added to the shared built-ins.
 *
 * Both controls encode rules that belong to this screen — a pipeline's fixed
 * ends, an invite's role cycle — so they are configuration for one form, not
 * vocabulary for every form. Promote one into the form layer if a second screen
 * ever needs it.
 */

interface StageRow {
  name: string;
  clientVisible: boolean;
}

/**
 * An ordered list of pipeline stages: rename, reorder, mark client-visible,
 * add and remove.
 *
 * The first and last rows are the fixed ends — every candidate enters at one
 * and a hire finishes at the other — so they carry a lock instead of a remove
 * control and cannot be moved out of position.
 */
function StageListWidget({ name, prop, field, t }: WidgetProps) {
  const rows: StageRow[] = Array.isArray(field.value) ? field.value : [];
  const update = (next: StageRow[]) => field.onChange(next);
  const swap = (from: number, to: number) => {
    const next = rows.slice();
    const moved = next[from];
    const other = next[to];
    if (!moved || !other) return;
    next[from] = other;
    next[to] = moved;
    update(next);
  };

  return (
    <FieldShell
      // The heading carries the live count, as the design's does.
      label={t(prop.title ?? name, { count: rows.length })}
      hideLabel={prop.hideLabel}
      labelSuffix={
        prop.labelHint ? (
          <Typography sx={{ fontSize: 11, color: "text.disabled" }}>{t(prop.labelHint)}</Typography>
        ) : undefined
      }
    >
      <Box
        sx={{ display: "flex", flexDirection: "column", gap: "8px" }}
        data-testid={`field-${name}`}
      >
        {rows.map((row, index) => {
          const fixed = index === 0 || index === rows.length - 1;
          const canUp = index > 1;
          const canDown = index > 0 && index < rows.length - 2;
          return (
            <Card
              // Positional, renameable rows — the index is the stable identity.
              // biome-ignore lint/suspicious/noArrayIndexKey: positional row
              key={index}
              variant="inset"
              data-testid={`stage-row-${index}`}
              sx={{
                display: "grid",
                gridTemplateColumns: "26px 1fr 96px 62px 30px",
                gap: "10px",
                alignItems: "center",
                borderRadius: "12px",
                p: "9px 12px",
              }}
            >
              <Typography
                sx={{ fontSize: 11, fontWeight: 700, color: "text.disabled", textAlign: "center" }}
              >
                {index + 1}
              </Typography>
              <InputBase
                value={row.name}
                placeholder={t(prop.placeholder ?? "")}
                data-testid={`stage-name-${index}`}
                onChange={(event) =>
                  update(rows.map((r, i) => (i === index ? { ...r, name: event.target.value } : r)))
                }
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "text.primary",
                  width: "100%",
                  "& .MuiInputBase-input": { p: "2px 0", height: "auto" },
                }}
              />
              <Box
                role="switch"
                aria-checked={row.clientVisible}
                tabIndex={0}
                data-testid={`stage-visibility-${index}`}
                onClick={() =>
                  update(
                    rows.map((r, i) =>
                      i === index ? { ...r, clientVisible: !r.clientVisible } : r,
                    ),
                  )
                }
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: 10.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  color: row.clientVisible ? "surface.successFg" : "text.disabled",
                }}
              >
                {row.clientVisible ? (
                  <VisibilityRounded sx={{ fontSize: 15 }} />
                ) : (
                  <VisibilityOffRounded sx={{ fontSize: 15 }} />
                )}
                {t(row.clientVisible ? "stages.client" : "stages.internal")}
              </Box>
              <Box sx={{ display: "flex", gap: "2px", justifySelf: "center" }}>
                <KeyboardArrowUpRounded
                  data-testid={`stage-up-${index}`}
                  onClick={() => canUp && swap(index, index - 1)}
                  sx={{
                    fontSize: 16,
                    color: canUp ? "text.secondary" : "surface.controlOutline",
                    cursor: canUp ? "pointer" : "default",
                  }}
                />
                <KeyboardArrowDownRounded
                  data-testid={`stage-down-${index}`}
                  onClick={() => canDown && swap(index, index + 1)}
                  sx={{
                    fontSize: 16,
                    color: canDown ? "text.secondary" : "surface.controlOutline",
                    cursor: canDown ? "pointer" : "default",
                  }}
                />
              </Box>
              {fixed ? (
                <LockRounded
                  data-testid={`stage-locked-${index}`}
                  titleAccess={t("stages.fixed")}
                  sx={{ fontSize: 16, color: "surface.controlOutline", justifySelf: "center" }}
                />
              ) : (
                <CloseRounded
                  data-testid={`stage-remove-${index}`}
                  onClick={() => update(rows.filter((_, i) => i !== index))}
                  sx={{
                    fontSize: 16,
                    color: "text.disabled",
                    cursor: "pointer",
                    justifySelf: "center",
                    "&:hover": { color: "error.main" },
                  }}
                />
              )}
            </Card>
          );
        })}
      </Box>

      <Button
        variant="outlined"
        data-testid={`${name}-add`}
        startIcon={<AddRounded />}
        sx={{ mt: "12px", borderStyle: "dashed", alignSelf: "flex-start" }}
        onClick={() => {
          // New stages land before the hire stage — nothing follows a placement.
          const next = rows.slice();
          next.splice(Math.max(next.length - 1, 0), 0, { name: "", clientVisible: false });
          update(next);
        }}
      >
        {t(prop.addLabel ?? "stages.add")}
      </Button>
    </FieldShell>
  );
}

interface InviteRow {
  email: string;
  role: string;
}

/**
 * The invite rows: an address and a role on one line, as the design draws
 * them. The role cycles on click rather than opening a menu — there are four
 * of them and the row has no space for a select.
 */
function InviteListWidget({ name, prop, field, t }: WidgetProps) {
  const rows: InviteRow[] = Array.isArray(field.value) ? field.value : [];
  const roles = (prop.choices ?? []).map((choice) => choice.value);
  const fallback = roles[2] ?? roles[0] ?? "";
  const update = (next: InviteRow[]) => field.onChange(next);

  return (
    <FieldShell
      label={t(prop.title ?? name)}
      hideLabel={prop.hideLabel}
      labelSuffix={
        prop.labelHint ? (
          <Typography sx={{ fontSize: 11.5, color: "text.disabled" }}>
            {t(prop.labelHint, { count: rows.length })}
          </Typography>
        ) : undefined
      }
    >
      <Box
        sx={{ display: "flex", flexDirection: "column", gap: "8px" }}
        data-testid={`field-${name}`}
      >
        {rows.map((row, index) => (
          <Card
            // Positional, editable rows — the index is the stable identity.
            // biome-ignore lint/suspicious/noArrayIndexKey: positional row
            key={index}
            variant="inset"
            data-testid={`invite-row-${index}`}
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 150px 30px",
              gap: "10px",
              alignItems: "center",
              borderRadius: "12px",
              p: "9px 12px",
            }}
          >
            <InputBase
              type="email"
              value={row.email}
              placeholder={t(prop.placeholder ?? "")}
              data-testid={`invite-email-${index}`}
              onChange={(event) =>
                update(rows.map((r, i) => (i === index ? { ...r, email: event.target.value } : r)))
              }
              sx={{
                fontSize: 13,
                color: "text.primary",
                width: "100%",
                "& .MuiInputBase-input": { p: "2px 0", height: "auto" },
              }}
            />
            <Box
              tabIndex={0}
              role="button"
              title={t("team.cycleRole")}
              data-testid={`invite-role-${index}`}
              onClick={() =>
                update(
                  rows.map((r, i) =>
                    i === index
                      ? {
                          ...r,
                          role: roles[(roles.indexOf(r.role) + 1) % roles.length] ?? fallback,
                        }
                      : r,
                  ),
                )
              }
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "6px",
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "surface.controlBorder",
                borderRadius: "9px",
                p: "6px 10px",
                cursor: "pointer",
                "&:hover": { borderColor: "surface.primarySoftBorder" },
              }}
            >
              <Typography sx={{ fontSize: 11.5, fontWeight: 600 }}>
                {row.role || fallback}
              </Typography>
              <UnfoldMoreRounded sx={{ fontSize: 14, color: "text.disabled" }} />
            </Box>
            <Box
              role="button"
              tabIndex={0}
              data-testid={`invite-remove-${index}`}
              onClick={() => update(rows.filter((_, i) => i !== index))}
              sx={{
                display: "flex",
                justifyContent: "center",
                cursor: "pointer",
                color: "text.disabled",
                "&:hover": { color: "error.main" },
              }}
            >
              <CloseRounded sx={{ fontSize: 16 }} />
            </Box>
          </Card>
        ))}
      </Box>

      <Button
        variant="outlined"
        data-testid={`${name}-add`}
        startIcon={<PersonAddRounded />}
        sx={{ mt: "12px", borderStyle: "dashed", alignSelf: "flex-start" }}
        onClick={() => update([...rows, { email: "", role: fallback }])}
      >
        {t(prop.addLabel ?? "team.addAnother")}
      </Button>
    </FieldShell>
  );
}

/**
 * A live tally across several array fields — the design's "14 REASONS ACTIVE"
 * above the rejection groups, with its own note on the right.
 *
 * Display only: it writes nothing, it just reads what the other fields hold.
 */
function SelectionCountWidget({ name, prop, t }: WidgetProps) {
  const fields = prop.countFields ?? [];
  const values = useWatch({ name: fields }) as unknown[];
  const count = (Array.isArray(values) ? values : []).reduce<number>(
    (total, value) => total + (Array.isArray(value) ? value.length : 0),
    0,
  );

  return (
    <Box
      data-testid={`field-${name}`}
      data-count={count}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        flexWrap: "wrap",
      }}
    >
      <Typography
        sx={{ fontSize: 11, fontWeight: 700, letterSpacing: ".07em", color: "text.disabled" }}
      >
        {t(prop.title ?? name, { count })}
      </Typography>
      {prop.labelHint ? (
        <Typography sx={{ fontSize: 11, color: "text.disabled" }}>{t(prop.labelHint)}</Typography>
      ) : null}
    </Box>
  );
}

export const WIZARD_WIDGETS: Widgets = {
  "selection-count": SelectionCountWidget,
  "stage-list": StageListWidget,
  "invite-list": InviteListWidget,
};
