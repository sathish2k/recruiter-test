"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { Route } from "@recruit/sdk";
import Button from "@mui/material/Button";

type Injected<C = Record<string, unknown>, D = Record<string, unknown>> = {
  id?: string;
  configuration?: C;
  data?: D;
  translation?: Record<string, unknown>;
  currentRoute?: Route | null;
};

export function DemoSidebar({
  configuration,
  currentRoute,
}: Injected<{ items?: { label: string; routeId: string }[] }>) {
  const items = configuration?.items ?? [
    { label: "Home", routeId: "Root" },
    { label: "Candidates", routeId: "Candidates" },
    { label: "Roles", routeId: "Roles" },
  ];
  return (
    <Box
      sx={{
        width: 150,
        bgcolor: "#17141f",
        color: "#cbc6e2",
        p: 1.5,
        height: "100%",
      }}
    >
      <Typography
        sx={{ color: "#fff", fontWeight: 700, fontSize: 14, mb: 1.5 }}
      >
        AI Recruiter
      </Typography>
      <Stack spacing={0.5}>
        {items.map((it) => {
          const active =
            currentRoute?.id === it.routeId ||
            currentRoute?.id?.startsWith(it.routeId);
          return (
            <Box
              key={it.routeId}
              sx={{
                px: 1,
                py: 0.75,
                borderRadius: 1,
                fontSize: 13,
                bgcolor: active ? "primary.main" : "transparent",
                color: active ? "#fff" : "#cbc6e2",
              }}
            >
              {it.label}
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}

export function DemoAppBar({ configuration }: Injected<{ title?: string }>) {
  return (
    <Box
      sx={{
        height: 52,
        px: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Typography sx={{ fontWeight: 600 }}>
        {configuration?.title ?? "Dashboard"}
      </Typography>
      <Avatar
        sx={{ width: 28, height: 28, bgcolor: "secondary.main", fontSize: 13 }}
      >
        SS
      </Avatar>
    </Box>
  );
}

export function WelcomePanel({
  configuration,
  translation,
}: Injected<{ title?: string }>) {
  return (
    <Stack spacing={2} sx={{ alignItems: "flex-start", p: 1 }}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        {configuration?.title ?? "AI Recruiter"}
      </Typography>
      <Typography color="text.secondary">
        {(translation?.subtitle as string) ?? "Config-driven engine is live."}
      </Typography>
      <Button variant="contained">Get started</Button>
    </Stack>
  );
}

export function CandidatesTable({
  data,
}: Injected<
  Record<string, unknown>,
  { rows?: { name: string; stage: string }[] }
>) {
  const rows =
    data?.rows ??
    ([
      { name: "Maya Rodriguez", stage: "Screening" },
      { name: "Dan Okafor", stage: "Interview" },
    ] as { name: string; stage: string }[]);
  return (
    <Box>
      <Typography sx={{ fontWeight: 600, mb: 1 }}>Candidates</Typography>
      <Table size="small" sx={{ "& td, & th": { borderColor: "divider" } }}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Stage</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.name}>
              <TableCell>{r.name}</TableCell>
              <TableCell>
                <Chip size="small" label={r.stage} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

export function RoleDetail({ currentRoute }: Injected) {
  return (
    <Stack spacing={1} sx={{ p: 1 }}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        Role detail
      </Typography>
      <Typography color="text.secondary" sx={{ fontSize: 14 }}>
        Matched route:{" "}
        <Box component="code" sx={{ fontFamily: "monospace" }}>
          {currentRoute?.id} · {currentRoute?.path}
        </Box>
      </Typography>
    </Stack>
  );
}

export function SignInForm({ configuration }: Injected<{ title?: string }>) {
  return (
    <Stack spacing={2} sx={{ width: 260, mx: "auto" }}>
      <Typography variant="h6" sx={{ fontWeight: 700, textAlign: "center" }}>
        {configuration?.title ?? "Sign in"}
      </Typography>
      <TextField size="small" label="Email" />
      <TextField size="small" label="Password" type="password" />
      <Button variant="contained" fullWidth>
        Sign in
      </Button>
    </Stack>
  );
}

export function StatCard({
  configuration,
  data,
}: Injected<{ label?: string }, { value?: number | string }>) {
  return (
    <Box sx={{ p: 2, borderRadius: 2, bgcolor: "rgba(79,70,229,0.06)" }}>
      <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
        {configuration?.label ?? "Metric"}
      </Typography>
      <Typography sx={{ fontSize: 26, fontWeight: 700 }}>
        {(data?.value as string) ?? "—"}
      </Typography>
    </Box>
  );
}

export function InfoPanel({ configuration }: Injected<{ label?: string }>) {
  return (
    <Box
      sx={{
        p: 2,
        border: "1px dashed",
        borderColor: "divider",
        borderRadius: 2,
        textAlign: "center",
        color: "text.secondary",
        fontSize: 13,
      }}
    >
      {configuration?.label ?? "Panel"}
    </Box>
  );
}
