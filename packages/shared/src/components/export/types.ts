export interface ExportType {
  /** Translation key (resolved via id) or a literal label. */
  label: string;
  /** Export format — "csv" | "json" | "xlsx" | "pdf" | "docx". */
  value: string;
  /** Icon key: "pdf" | "excel" | "word" | "csv" | "json". */
  icon?: string;
  /** Icon color. */
  color?: string;
}

export interface ExportConfig {
  types: ExportType[];
}
