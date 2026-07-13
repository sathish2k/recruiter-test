"use client";

import { useCallback, useState } from "react";

type Row = Record<string, unknown>;

function download(content: string, mime: string, filename: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function toCsv(rows: Row[]): string {
  const headers = Object.keys(rows[0] ?? {});
  const csvEscape = (value: unknown) => {
    const s = value == null ? "" : String(value);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => csvEscape(row[h])).join(",")),
  ].join("\n");
}

export interface UseExportResult {
  exportData: (format: string, rows: Row[], filename?: string) => void;
  isExporting: boolean;
  error: string | null;
}

// Client-side export of row data to a downloaded file (CSV or JSON).
export function useExport(): UseExportResult {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportData = useCallback(
    (format: string, rows: Row[], filename = "export") => {
      if (!rows || rows.length === 0) {
        setError("No data to export");
        return;
      }
      setIsExporting(true);
      setError(null);
      try {
        if (format === "json") {
          download(
            JSON.stringify(rows, null, 2),
            "application/json;charset=utf-8;",
            `${filename}.json`,
          );
        } else {
          download(toCsv(rows), "text/csv;charset=utf-8;", `${filename}.csv`);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Export failed");
      } finally {
        setIsExporting(false);
      }
    },
    [],
  );

  return { exportData, isExporting, error };
}
