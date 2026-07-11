"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  type Configuration,
  findRouteBySlug,
  generateRenderTree,
  type Route,
} from "@recruit/sdk";
import { type ReactNode, useMemo, useState } from "react";
import { MONO } from "../lib/theme";

const ROUTES: Route[] = [
  {
    id: "Root",
    path: "/",
    layout: "Core.Layout",
    page: "Home.Page",
    children: ["Candidates", "Roles"],
  },
  {
    id: "Candidates",
    path: "candidates",
    page: "Candidates.Page",
    children: ["CandidateDetail"],
  },
  {
    id: "CandidateDetail",
    path: ":id",
    page: "CandidateDetail.Page",
    children: [],
  },
  { id: "Roles", path: "roles", page: "Roles.Page", children: [] },
  {
    id: "SignIn",
    path: "signin",
    layout: "Auth.Layout",
    page: "SignIn.Page",
    children: [],
  },
];

const CONFIGS: Configuration[] = [
  {
    id: "Core.Layout",
    template: "core",
    elements: [{ id: "o", type: "outlet" }],
  },
  {
    id: "Auth.Layout",
    template: "auth",
    elements: [{ id: "o", type: "outlet" }],
  },
  { id: "Home.Page", elements: [] },
  { id: "Candidates.Page", elements: [] },
  { id: "CandidateDetail.Page", elements: [] },
  { id: "Roles.Page", elements: [] },
  { id: "SignIn.Page", elements: [] },
];

const PRESETS = [
  "/",
  "/candidates",
  "/candidates/42",
  "/roles",
  "/signin",
  "/nope",
];

function parseUrl(url: string): string[] {
  const clean = url.trim().replace(/^\/+/, "").replace(/\/+$/, "");
  return clean === "" ? [] : clean.split("/");
}

const norm = (u: string): string => `/${parseUrl(u).join("/")}`;

const mono = { fontFamily: MONO, fontSize: 13 };

export function RouteResolver() {
  const [url, setUrl] = useState("/");
  const { slugParts, matched, tree } = useMemo(() => {
    const s = parseUrl(url);
    const m = findRouteBySlug(s, ROUTES);
    const t = m ? generateRenderTree(m, CONFIGS, ROUTES, s) : null;
    return { slugParts: s, matched: m, tree: t };
  }, [url]);

  return (
    <Box sx={{ width: "100%" }}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ flexWrap: "wrap", gap: 1, mb: 2 }}
      >
        {PRESETS.map((p) => (
          <Chip
            key={p}
            label={p}
            onClick={() => setUrl(p)}
            color={norm(url) === norm(p) ? "primary" : "default"}
            variant={norm(url) === norm(p) ? "filled" : "outlined"}
            sx={{ ...mono }}
          />
        ))}
      </Stack>

      <TextField
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        fullWidth
        size="small"
        label="URL path"
        slotProps={{ input: { sx: mono } }}
        sx={{ mb: 2.5 }}
      />

      <Stack spacing={2}>
        <Row label="slugParts">
          <Box sx={mono}>[{slugParts.map((s) => `"${s}"`).join(", ")}]</Box>
        </Row>

        <Row label="matched branch">
          {matched ? (
            <Stack
              direction="row"
              spacing={0.5}
              sx={{ flexWrap: "wrap", gap: 0.5 }}
            >
              {matched.map((r, i) => (
                <Chip
                  key={r.id}
                  size="small"
                  label={r.id}
                  color={i === matched.length - 1 ? "primary" : "default"}
                  variant={i === matched.length - 1 ? "filled" : "outlined"}
                  sx={mono}
                />
              ))}
            </Stack>
          ) : (
            <Chip
              size="small"
              color="error"
              variant="outlined"
              label="null → 404"
              sx={mono}
            />
          )}
        </Row>

        <Row label="render tree">
          {tree?.page ? (
            <Stack spacing={0.75}>
              {tree.layouts.map((l) => (
                <Stack
                  key={l.id}
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center" }}
                >
                  <Chip
                    size="small"
                    label={l.template ?? "custom"}
                    sx={{ ...mono, height: 20 }}
                  />
                  <Box sx={mono}>{l.id}</Box>
                </Stack>
              ))}
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Chip
                  size="small"
                  color="success"
                  label="page"
                  sx={{ ...mono, height: 20 }}
                />
                <Box sx={mono}>{tree.page.id}</Box>
              </Stack>
            </Stack>
          ) : (
            <Typography sx={{ ...mono, color: "text.secondary" }}>
              no page → 404
            </Typography>
          )}
        </Row>
      </Stack>
    </Box>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "120px 1fr",
        gap: 2,
        alignItems: "start",
      }}
    >
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "text.secondary",
          pt: 0.5,
        }}
      >
        {label}
      </Typography>
      <Box>{children}</Box>
    </Box>
  );
}
