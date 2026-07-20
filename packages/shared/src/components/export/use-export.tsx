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

function htmlEscape(value: unknown): string {
  const s = value == null ? "" : String(value);
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function toHtmlTable(rows: Row[]): string {
  const headers = Object.keys(rows[0] ?? {});
  const head = headers.map((h) => `<th>${htmlEscape(h)}</th>`).join("");
  const body = rows
    .map((row) => `<tr>${headers.map((h) => `<td>${htmlEscape(row[h])}</td>`).join("")}</tr>`)
    .join("");
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

const TABLE_STYLE = `table{border-collapse:collapse;width:100%;font-family:Arial,Helvetica,sans-serif;font-size:12px}th,td{border:1px solid #999;padding:6px 10px;text-align:left}th{background:#eee;font-weight:bold}`;

function toHtmlDocument(rows: Row[], title: string): string {
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>${htmlEscape(title)}</title><style>${TABLE_STYLE}</style></head><body>${toHtmlTable(rows)}</body></html>`;
}

function printPdf(rows: Row[], title: string) {
  const win = window.open("", "_blank");
  if (!win) throw new Error("Popup blocked");
  win.document.write(
    `<html><head><meta charset="utf-8"><title>${htmlEscape(title)}</title><style>${TABLE_STYLE}h1{font-family:Arial,Helvetica,sans-serif;font-size:16px}</style></head><body><h1>${htmlEscape(title)}</h1>${toHtmlTable(rows)}</body></html>`,
  );
  win.document.close();
  win.focus();
  win.print();
}

export interface UseExportResult {
  exportData: (format: string, rows: Row[], filename?: string) => void;
  isExporting: boolean;
  error: string | null;
}

export function useExport(): UseExportResult {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportData = useCallback((format: string, rows: Row[], filename = "export") => {
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
      } else if (format === "xlsx") {
        download(toHtmlDocument(rows, filename), "application/vnd.ms-excel", `${filename}.xls`);
      } else if (format === "docx") {
        download(toHtmlDocument(rows, filename), "application/msword", `${filename}.doc`);
      } else if (format === "pdf") {
        printPdf(rows, filename);
      } else {
        download(toCsv(rows), "text/csv;charset=utf-8;", `${filename}.csv`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setIsExporting(false);
    }
  }, []);

  return { exportData, isExporting, error };
}
