"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Menu from "@mui/material/Menu";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { IconRenderer, SearchField } from "@recruit/shared";
import type { RecordScope } from "@recruit/types";
import { type MouseEvent, useState } from "react";
import type { PermissionColumn, PermissionsConfig } from "./permissions.configuration";
import { isForced, type RoleDraft } from "./permissions.model";
import type { Translate } from "./permissions.types";

/** `minmax(220px,1fr) repeat(5,72px) 150px` — the design's matrix track. */
const grid = (columns: number) => `minmax(200px,1fr) repeat(${columns},72px) 132px`;

/**
 * The matrix' single mark. Three states: off, on, and on-because-something-
 * else-needs-it — the last reads lighter and refuses the click, so it explains
 * itself rather than snapping back.
 */
function Tick({
  on,
  forced,
  size = 18,
  indeterminate,
}: {
  on: boolean;
  forced?: boolean;
  size?: number;
  indeterminate?: boolean;
}) {
  const fill = forced ? "var(--mui-palette-primary-light)" : "var(--mui-palette-primary-main)";
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: "5px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1.5px solid",
        borderColor: on ? fill : "surface.controlOutline",
        bgcolor: on ? fill : "transparent",
      }}
    >
      {on ? (
        <IconRenderer
          name={indeterminate ? "remove" : "check"}
          size={size - 5}
          sx={{ color: "primary.contrastText" }}
        />
      ) : null}
    </Box>
  );
}

export interface MatrixRow {
  resource: string;
  icon: string;
  scoped: boolean;
  name: string;
  hint: string;
}

export interface MatrixGroup {
  key: string;
  title: string;
  rows: MatrixRow[];
}

export interface PermissionMatrixProps {
  config: PermissionsConfig;
  groups: MatrixGroup[];
  /** Every visible resource, flattened — what a column toggle acts on. */
  visible: string[];
  draft: RoleDraft;
  roleLabel: string;
  system: boolean;
  locked: boolean;
  note: string;
  query: string;
  onQuery: (value: string) => void;
  collapsed: Record<string, boolean>;
  onToggleGroup: (key: string) => void;
  onToggleCell: (resource: string, column: string, on: boolean) => void;
  onToggleColumn: (column: string, on: boolean) => void;
  onCycleScope: (resource: string) => void;
  /** Every resource with its label, for the coverage popover. */
  coverage: { resource: string; name: string; letters: string; on: boolean }[];
  t: Translate;
}

export function PermissionMatrix({
  config,
  groups,
  visible,
  draft,
  roleLabel,
  system,
  locked,
  note,
  query,
  onQuery,
  collapsed,
  onToggleGroup,
  onToggleCell,
  onToggleColumn,
  onCycleScope,
  coverage,
  t,
}: PermissionMatrixProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const columns = config.columns;
  const reached = coverage.filter((entry) => entry.on).length;

  const columnState = (column: PermissionColumn) => {
    const on =
      visible.length > 0 && visible.every((r) => (draft.grants[r] ?? []).includes(column.key));
    const some = visible.some((r) => (draft.grants[r] ?? []).includes(column.key));
    return { on, some };
  };

  return (
    <Card variant="base" sx={{ p: 0, overflow: "visible" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
          p: "22px 24px 14px",
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "9px", flexWrap: "wrap" }}>
            <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{t("matrix.title")}</Typography>
            <Chip
              variant="badge"
              color={system ? "default" : "secondary"}
              label={system ? t("matrix.systemTag") : t("matrix.customTag")}
            />
          </Box>
          <Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: "3px" }}>
            {system ? t("matrix.subtitle") : t("matrix.customSubtitle")}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            onClick={(event: MouseEvent<HTMLElement>) => setAnchor(event.currentTarget)}
            startIcon={<IconRenderer name="dataset" size={16} />}
            endIcon={<IconRenderer name="expand-more" size={16} />}
          >
            {t("matrix.coverage", { reached, total: coverage.length })}
          </Button>
          <Menu
            open={!!anchor}
            anchorEl={anchor}
            onClose={() => setAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slotProps={{ paper: { variant: "dropdown", sx: { width: 250, maxHeight: 330 } } }}
          >
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: ".07em",
                color: "text.secondary",
                p: "6px 8px 8px",
              }}
            >
              {t("matrix.coverageTitle", { role: roleLabel })}
            </Typography>
            {coverage.map((entry) => (
              <Box
                key={entry.resource}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  p: "7px 8px",
                  fontSize: 12.5,
                  color: entry.on ? "text.secondary" : "surface.textFaint",
                }}
              >
                <IconRenderer
                  name={entry.on ? "check" : "close"}
                  size={16}
                  sx={{ color: entry.on ? "surface.successFg" : "surface.textFaint", flex: "none" }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>{entry.name}</Box>
                <Box sx={{ fontSize: 11, color: "surface.textFaint" }}>
                  {entry.letters || t("matrix.coverageNone")}
                </Box>
              </Box>
            ))}
          </Menu>
          <SearchField
            value={query}
            onChange={onQuery}
            placeholder={t("matrix.search")}
            width={220}
          />
        </Box>
      </Box>

      {note ? (
        <Card
          variant="inset"
          sx={{
            m: "0 24px 14px",
            display: "flex",
            gap: "11px",
            fontSize: 12,
            lineHeight: 1.6,
            color: "text.secondary",
          }}
        >
          <IconRenderer name="lock" size={17} sx={{ flex: "none", mt: "2px" }} />
          <Box>{note}</Box>
        </Card>
      ) : null}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: grid(columns.length),
          gap: "10px",
          alignItems: "center",
          p: "10px 24px",
          borderTop: "1px dashed",
          borderBottom: "1px dashed",
          borderColor: "divider",
        }}
      >
        <Typography
          sx={{ fontSize: 10.5, fontWeight: 800, letterSpacing: ".07em", color: "text.secondary" }}
        >
          {t("matrix.resource")}
        </Typography>
        {columns.map((column) => {
          const { on, some } = columnState(column);
          const label = t(column.label);
          return (
            <Box
              key={column.key}
              sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}
            >
              <Typography
                sx={{
                  fontSize: 10.5,
                  fontWeight: 800,
                  letterSpacing: ".06em",
                  color: "text.secondary",
                }}
              >
                {label}
              </Typography>
              <Tooltip
                title={
                  locked
                    ? t("matrix.tips.frozen")
                    : t(on ? "matrix.tips.clearAll" : "matrix.tips.grantAll", {
                        column: label.toLowerCase(),
                        count: visible.length,
                      })
                }
                placement="top"
              >
                <Box
                  onClick={() => {
                    if (!locked) onToggleColumn(column.key, !on);
                  }}
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    cursor: locked ? "not-allowed" : "pointer",
                    opacity: locked ? 0.45 : 1,
                  }}
                >
                  <Tick on={on || some} indeterminate={!on && some} size={16} />
                </Box>
              </Tooltip>
            </Box>
          );
        })}
        <Typography
          sx={{
            fontSize: 10.5,
            fontWeight: 800,
            letterSpacing: ".07em",
            color: "text.secondary",
            textAlign: "right",
          }}
        >
          {t("matrix.recordScope")}
        </Typography>
      </Box>

      {groups.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            p: "44px 24px",
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: "999px",
              bgcolor: "surface.inset",
              color: "text.disabled",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconRenderer name="search-off" size={26} />
          </Box>
          <Typography sx={{ fontSize: 15, fontWeight: 700, mt: "14px" }}>
            {t("matrix.emptyTitle", { query })}
          </Typography>
          <Typography
            sx={{
              fontSize: 12.5,
              lineHeight: 1.6,
              color: "text.secondary",
              mt: "6px",
              maxWidth: "40ch",
            }}
          >
            {t("matrix.emptyBody")}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => onQuery("")}
            startIcon={<IconRenderer name="close" size={16} />}
            sx={{ mt: "16px" }}
          >
            {t("matrix.clearSearch")}
          </Button>
        </Box>
      ) : null}

      {groups.map((group) => {
        const open = !collapsed[group.key];
        const granted = group.rows.reduce(
          (total, row) => total + (draft.grants[row.resource] ?? []).length,
          0,
        );
        return (
          <Box key={group.key}>
            <Box
              onClick={() => onToggleGroup(group.key)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                p: "11px 24px",
                bgcolor: "surface.inset",
                cursor: "pointer",
              }}
            >
              <IconRenderer
                name="expand-more"
                size={17}
                sx={{
                  color: "text.disabled",
                  transform: open ? "rotate(0deg)" : "rotate(-90deg)",
                  transition: "var(--recruit-motion-state)",
                }}
              />
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: ".07em",
                  color: "text.primary",
                }}
              >
                {group.title}
              </Typography>
              <Typography
                sx={{
                  fontSize: 11,
                  color: "text.secondary",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {t("matrix.granted", { on: granted, total: group.rows.length * columns.length })}
              </Typography>
            </Box>

            {open
              ? group.rows.map((row) => {
                  const rowGrants = draft.grants[row.resource] ?? [];
                  const scope = draft.scope[row.resource] ?? "all";
                  return (
                    <Box
                      key={row.resource}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: grid(columns.length),
                        gap: "10px",
                        alignItems: "center",
                        p: "11px 24px",
                        borderBottom: "1px dashed",
                        borderColor: "divider",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                        <IconRenderer
                          name={row.icon}
                          size={18}
                          sx={{ color: "text.disabled", flex: "none" }}
                        />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{row.name}</Typography>
                          <Typography
                            sx={{
                              fontSize: 11,
                              color: "surface.textFaint",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {row.hint}
                          </Typography>
                        </Box>
                      </Box>

                      {columns.map((column) => {
                        const on = rowGrants.includes(column.key);
                        const forced = on && isForced(columns, rowGrants, column.key);
                        const label = t(column.label).toLowerCase();
                        return (
                          <Tooltip
                            key={column.key}
                            placement="top"
                            title={
                              locked
                                ? t("matrix.tips.frozen")
                                : forced
                                  ? t("matrix.tips.forced", {
                                      column: label,
                                      resource: row.name,
                                    })
                                  : t(on ? "matrix.tips.remove" : "matrix.tips.grant", {
                                      column: label,
                                      resource: row.name,
                                    })
                            }
                          >
                            <Box
                              onClick={() => {
                                if (!locked && !forced) onToggleCell(row.resource, column.key, !on);
                              }}
                              sx={{
                                display: "flex",
                                justifyContent: "center",
                                cursor: locked || forced ? "not-allowed" : "pointer",
                                opacity: locked ? 0.45 : forced ? 0.8 : 1,
                              }}
                            >
                              <Tick on={on} forced={forced} />
                            </Box>
                          </Tooltip>
                        );
                      })}

                      <Tooltip
                        placement="top"
                        title={
                          !row.scoped
                            ? t("matrix.tips.scopeNone", { resource: row.name })
                            : locked
                              ? t("matrix.tips.scopeFrozen")
                              : t("matrix.tips.scope")
                        }
                      >
                        <Box
                          onClick={() => {
                            if (row.scoped && !locked) onCycleScope(row.resource);
                          }}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: "6px",
                            fontSize: 12,
                            fontWeight: 700,
                            color: row.scoped ? "text.primary" : "surface.textFaint",
                            cursor: row.scoped && !locked ? "pointer" : "not-allowed",
                            opacity: row.scoped ? 1 : 0.5,
                          }}
                        >
                          {row.scoped ? t(`scopes.${scope as RecordScope}`) : t("scopes.none")}
                          <IconRenderer
                            name="unfold-more"
                            size={15}
                            sx={{ color: "text.disabled" }}
                          />
                        </Box>
                      </Tooltip>
                    </Box>
                  );
                })
              : null}
          </Box>
        );
      })}
    </Card>
  );
}
