/**
 * Minimal RFC-4180 reader: quoted fields may hold commas, newlines and escaped
 * quotes (`""`). Enough for the spreadsheets recruiters actually export, and
 * small enough to keep in the repo rather than adding a dependency.
 */
export function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  const endField = () => {
    row.push(field.trim());
    field = "";
  };
  const endRow = () => {
    endField();
    // A trailing newline must not produce a row of one empty cell.
    if (row.some((cell) => cell !== "")) rows.push(row);
    row = [];
  };

  const source = text.replace(/^﻿/, "");
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];

    if (quoted) {
      if (char === '"') {
        if (source[index + 1] === '"') {
          field += '"';
          index += 1;
        } else quoted = false;
      } else field += char;
      continue;
    }

    if (char === '"') quoted = true;
    else if (char === ",") endField();
    else if (char === "\n") endRow();
    else if (char !== "\r") field += char;
  }
  endRow();

  const [headers = [], ...body] = rows;
  return { headers, rows: body };
}
