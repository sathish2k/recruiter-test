"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, usePortalRouter, useTranslation } from "@recruit/sdk";
import {
  applyExtraction,
  extractionPlan,
  IconRenderer,
  parseCsv,
  planToContract,
  useToast,
} from "@recruit/shared";
import { useMemo, useRef, useState } from "react";
import type { CandidateImportConfiguration } from "./candidate-import.configuration";

interface DuplicateMatch {
  id: string;
  name: string;
  matchedOn?: string[];
}

type RowStatus = "ready" | "failed" | "duplicate" | "created" | "merged" | "skipped";

interface ImportRow {
  key: string;
  /** Where the row came from — a file name or a CSV line. */
  source: string;
  values: Record<string, unknown>;
  status: RowStatus;
  error?: string;
  duplicates?: DuplicateMatch[];
  /** What the reviewer decided for a row the check flagged. */
  action: "create" | "skip" | "merge";
  targetId?: string;
  /** The record this row ended up as, once it has been written. */
  candidateId?: string;
}

interface Outcome {
  index: number;
  status: "created" | "merged" | "skipped" | "duplicate";
  candidateId?: string;
  duplicates?: DuplicateMatch[];
}

const str = (value: unknown) => (typeof value === "string" ? value : "");
const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
const DONE: RowStatus[] = ["created", "merged", "skipped", "failed"];

/**
 * The batch intake paths — a pile of CVs, or a CSV. Both land in the same
 * review table, and both commit through `POST /candidates/import`, which runs
 * the workspace's duplicate check on every row; nothing here decides on its own
 * that a person is new.
 */
export function CandidateImportComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<CandidateImportConfiguration>(id);
  const { show } = useToast();
  const router = usePortalRouter();
  const { mutation } = useFetch(id);
  const mut = mutation as Record<string, ((...args: unknown[]) => Promise<unknown>) | undefined>;

  const [rows, setRows] = useState<ImportRow[]>([]);
  const [busy, setBusy] = useState<"parsing" | "importing" | null>(null);
  const [progress, setProgress] = useState("");
  const cvInput = useRef<HTMLInputElement>(null);
  const csvInput = useRef<HTMLInputElement>(null);

  const plan = useMemo(() => extractionPlan(config.schema), [config.schema]);
  const contract = useMemo(() => planToContract(plan), [plan]);

  /** Header text → schema field, matched on the field name or its label. */
  const columnIndex = useMemo(() => {
    const index = new Map<string, string>();
    for (const [name, prop] of Object.entries(config.schema?.properties ?? {})) {
      index.set(normalize(name), name);
      if (prop.title) index.set(normalize(t(prop.title)), name);
    }
    return index;
  }, [config.schema, t]);

  const listKinds = useMemo(
    () => new Set(plan.filter((field) => field.kind === "stringList").map((field) => field.name)),
    [plan],
  );

  const addRows = (incoming: ImportRow[]) => setRows((current) => [...current, ...incoming]);

  /** One parse per CV, sequential — the extraction is a paid model call and a
   * dropped folder would otherwise fire twenty at once. */
  const parseResumes = async (files: File[]) => {
    setBusy("parsing");
    const parsed: ImportRow[] = [];
    try {
      for (const [index, file] of files.slice(0, config.maxFiles).entries()) {
        setProgress(
          t("progress.parsing", { done: String(index + 1), total: String(files.length) }),
        );
        try {
          const extracted = (await mut.parseDocument?.(file, contract)) as Record<string, unknown>;
          const { values } = applyExtraction(plan, extracted ?? {}, {});
          parsed.push({
            key: `${file.name}-${index}`,
            source: file.name,
            values: { ...values, source: "resume_upload" },
            status: str(values.firstName) ? "ready" : "failed",
            error: str(values.firstName) ? undefined : t("errors.noName"),
            action: "create",
          });
        } catch {
          parsed.push({
            key: `${file.name}-${index}`,
            source: file.name,
            values: {},
            status: "failed",
            error: t("errors.parse"),
            action: "skip",
          });
        }
      }
      addRows(parsed);
    } finally {
      setBusy(null);
      setProgress("");
    }
  };

  const readCsv = async (file: File) => {
    const { headers, rows: lines } = parseCsv(await file.text());
    const mapped = headers.map((header) => columnIndex.get(normalize(header)));
    if (!mapped.some(Boolean)) {
      show(t("errors.noColumns"));
      return;
    }

    addRows(
      lines.slice(0, config.maxFiles * 10).map((line, index) => {
        const raw: Record<string, unknown> = {};
        mapped.forEach((name, column) => {
          const cell = line[column]?.trim();
          if (!name || !cell) return;
          // A list column arrives as one cell — "React; Node" is two skills.
          raw[name] = listKinds.has(name)
            ? cell
                .split(/[;,|]/)
                .map((part) => part.trim())
                .filter(Boolean)
            : cell;
        });
        const { values } = applyExtraction(plan, raw, {});
        return {
          key: `csv-${index}`,
          source: t("source.csvRow", { line: String(index + 2) }),
          values: { ...values, source: "csv_import" },
          status: str(values.firstName) ? ("ready" as const) : ("failed" as const),
          error: str(values.firstName) ? undefined : t("errors.noName"),
          action: "create" as const,
        };
      }),
    );
  };

  const setAction = (key: string, action: ImportRow["action"], targetId?: string) =>
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, action, targetId } : row)),
    );

  const pending = rows.filter((row) => !DONE.includes(row.status));

  const runImport = async () => {
    if (!pending.length) return;
    setBusy("importing");
    try {
      const response = (await mut.create?.({
        rows: pending.map((row) => ({
          values: row.values,
          mode: row.action,
          targetId: row.targetId,
          // Second pass: the reviewer looked at the match and still wants a
          // new record.
          force: row.status === "duplicate" && row.action === "create",
        })),
      })) as { data?: Outcome[]; meta?: Record<string, number> } | undefined;

      const outcomes = response?.data ?? [];
      setRows((current) =>
        current.map((row) => {
          const at = pending.findIndex((entry) => entry.key === row.key);
          const outcome = at >= 0 ? outcomes.find((entry) => entry.index === at) : undefined;
          if (!outcome) return row;
          return {
            ...row,
            status: outcome.status,
            duplicates: outcome.duplicates,
            candidateId: outcome.candidateId,
            // A flagged row defaults to merging into the record already held.
            action: outcome.status === "duplicate" ? "merge" : row.action,
            targetId: outcome.duplicates?.[0]?.id ?? row.targetId,
          };
        }),
      );
      const meta = response?.meta ?? {};
      show(
        t("toast.imported", {
          created: String(meta.created ?? 0),
          merged: String(meta.merged ?? 0),
          duplicates: String(meta.duplicates ?? 0),
        }),
      );
    } finally {
      setBusy(null);
    }
  };

  const label = (name: string) => t(config.schema?.properties?.[name]?.title ?? name);

  const statusColor: Record<RowStatus, "default" | "success" | "warning" | "error"> = {
    ready: "default",
    failed: "error",
    duplicate: "warning",
    created: "success",
    merged: "success",
    skipped: "default",
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <Box>
          <Typography sx={{ fontSize: 20, fontWeight: 700 }}>{t("title")}</Typography>
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>{t("description")}</Typography>
        </Box>
        <Button variant="outlined" onClick={() => router.push(config.listRouteId)}>
          {t("actions.back")}
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        {(
          [
            {
              key: "resumes",
              icon: "upload-file",
              onClick: () => cvInput.current?.click(),
            },
            { key: "csv", icon: "csv", onClick: () => csvInput.current?.click() },
          ] as const
        ).map((source) => (
          <Card
            key={source.key}
            variant="interactive"
            onClick={source.onClick}
            sx={{
              flex: "1 1 280px",
              p: "20px 22px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              cursor: "pointer",
            }}
          >
            <Box sx={{ color: "surface.accentBright", display: "flex", flex: "none" }}>
              <IconRenderer name={source.icon} size={22} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 14.5, fontWeight: 700 }}>
                {t(`sources.${source.key}.title`)}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                {t(`sources.${source.key}.hint`)}
              </Typography>
            </Box>
          </Card>
        ))}
      </Box>

      <input
        ref={cvInput}
        type="file"
        hidden
        multiple
        accept={config.accept}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = "";
          if (files.length) void parseResumes(files);
        }}
      />
      <input
        ref={csvInput}
        type="file"
        hidden
        accept=".csv,text/csv"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void readCsv(file);
        }}
      />

      {busy === "parsing" ? (
        <Typography sx={{ fontSize: 13, color: "text.secondary" }}>{progress}</Typography>
      ) : null}

      {rows.length ? (
        <Card variant="base" sx={{ p: "8px 4px 4px" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t("columns.source")}</TableCell>
                {config.reviewFields.map((name) => (
                  <TableCell key={name}>{label(name)}</TableCell>
                ))}
                <TableCell>{t("columns.status")}</TableCell>
                <TableCell>{t("columns.action")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.key} data-row-status={row.status}>
                  <TableCell sx={{ color: "text.secondary" }}>{row.source}</TableCell>
                  {config.reviewFields.map((name) => (
                    <TableCell key={name}>{str(row.values[name])}</TableCell>
                  ))}
                  <TableCell>
                    <Chip
                      variant="soft"
                      size="small"
                      color={statusColor[row.status]}
                      label={
                        row.status === "duplicate"
                          ? t("status.duplicate", { name: row.duplicates?.[0]?.name ?? "" })
                          : t(`status.${row.status}`)
                      }
                    />
                    {row.error ? (
                      <Typography sx={{ fontSize: 11.5, color: "text.disabled" }}>
                        {row.error}
                      </Typography>
                    ) : null}
                  </TableCell>
                  <TableCell sx={{ width: 190 }}>
                    {row.status === "duplicate" ? (
                      <TextField
                        select
                        hiddenLabel
                        size="small"
                        fullWidth
                        value={row.action}
                        onChange={(event) =>
                          setAction(
                            row.key,
                            event.target.value as ImportRow["action"],
                            row.duplicates?.[0]?.id,
                          )
                        }
                      >
                        <MenuItem value="merge">{t("actions.merge")}</MenuItem>
                        <MenuItem value="create">{t("actions.createAnyway")}</MenuItem>
                        <MenuItem value="skip">{t("actions.skip")}</MenuItem>
                      </TextField>
                    ) : row.status === "created" || row.status === "merged" ? (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() =>
                          router.push(config.editRouteId, { id: String(row.candidateId ?? "") })
                        }
                        disabled={!row.candidateId}
                      >
                        {t("actions.open")}
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : null}

      {rows.length ? (
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <Button variant="outlined" onClick={() => setRows([])} disabled={busy !== null}>
            {t("actions.clear")}
          </Button>
          <Button
            variant="contained"
            onClick={runImport}
            loading={busy === "importing"}
            disabled={!pending.length}
            startIcon={<IconRenderer name="person-add" size={16} />}
          >
            {t("actions.import", { count: String(pending.length) })}
          </Button>
        </Box>
      ) : null}
    </Box>
  );
}
