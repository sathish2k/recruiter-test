import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { MONO } from "../lib/theme";

export function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function textOf(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(textOf).join("");
  return "";
}

export function PageTitle({ children }: { children: ReactNode }) {
  return (
    <Typography variant="h1" component="h1" sx={{ mb: 1.5 }}>
      {children}
    </Typography>
  );
}

export function Lead({ children }: { children: ReactNode }) {
  return (
    <Typography
      sx={{ fontSize: 18, color: "text.secondary", mb: 4, maxWidth: "62ch" }}
    >
      {children}
    </Typography>
  );
}

export function H2({ children }: { children: ReactNode }) {
  const id = slug(textOf(children));
  return (
    <Typography
      variant="h2"
      component="h2"
      id={id}
      sx={{ mt: 6, mb: 1.5, scrollMarginTop: 88 }}
    >
      {children}
    </Typography>
  );
}

export function H3({ children }: { children: ReactNode }) {
  const id = slug(textOf(children));
  return (
    <Typography
      variant="h3"
      component="h3"
      id={id}
      sx={{ mt: 4, mb: 1, scrollMarginTop: 88 }}
    >
      {children}
    </Typography>
  );
}

export function P({ children }: { children: ReactNode }) {
  return (
    <Typography sx={{ mb: 2, maxWidth: "68ch", color: "text.primary" }}>
      {children}
    </Typography>
  );
}

export function C({ children }: { children: ReactNode }) {
  return (
    <Box
      component="code"
      sx={{
        fontFamily: MONO,
        fontSize: "0.85em",
        bgcolor: "rgba(79,70,229,0.08)",
        color: "#3730a3",
        px: 0.75,
        py: 0.25,
        borderRadius: 1,
      }}
    >
      {children}
    </Box>
  );
}

export interface PropRow {
  name: string;
  type: string;
  required?: boolean;
  desc: ReactNode;
}

export function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <Box sx={{ my: 3, overflowX: "auto" }}>
      <Table
        size="small"
        sx={{
          "& td, & th": { borderColor: "divider", verticalAlign: "top" },
          "& th": { fontWeight: 700, fontSize: 12, color: "text.secondary" },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Description</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.name}>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                <Box component="code" sx={{ fontFamily: MONO, fontSize: 12.5 }}>
                  {r.name}
                </Box>
                {r.required ? (
                  <Box
                    component="span"
                    sx={{ color: "error.main", ml: 0.5, fontSize: 12 }}
                    aria-label="required"
                  >
                    *
                  </Box>
                ) : null}
              </TableCell>
              <TableCell>
                <Box
                  component="code"
                  sx={{ fontFamily: MONO, fontSize: 12, color: "#3730a3" }}
                >
                  {r.type}
                </Box>
              </TableCell>
              <TableCell sx={{ fontSize: 13.5, color: "text.secondary" }}>
                {r.desc}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

export function Callout({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: "info" | "warning";
}) {
  const styles =
    tone === "warning"
      ? { border: "#f0b429", bg: "#fdf6e3", ink: "#8a6d1a" }
      : { border: "#4f46e5", bg: "#f4f3fe", ink: "#3730a3" };
  return (
    <Box
      sx={{
        my: 3,
        px: 2,
        py: 1.5,
        borderLeft: "3px solid",
        borderColor: styles.border,
        bgcolor: styles.bg,
        borderRadius: "0 8px 8px 0",
        "& p": { m: 0 },
        color: styles.ink,
        fontSize: 14.5,
        maxWidth: "68ch",
      }}
    >
      {children}
    </Box>
  );
}
