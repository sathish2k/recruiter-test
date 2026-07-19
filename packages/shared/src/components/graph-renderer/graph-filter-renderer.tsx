"use client";

import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import delve from "dlv";
import { useState } from "react";
import { IconRenderer } from "../renderers";
import { GraphRenderer } from "./graph-renderer";
import type { GraphFilterConfig, GraphRow } from "./graph-renderer.types";

const selectSx = {
  minWidth: 130,
  fontSize: 12.5,
  color: "#C9C5BD",
  ".MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255,255,255,.14)",
  },
  ".MuiSelect-select": { p: "7px 12px" },
};

export function GraphFilterRenderer({
  id,
  config: configProp,
  data: dataProp,
}: {
  id: string;
  config?: GraphFilterConfig;
  data?: GraphRow[];
}) {
  const { t } = useTranslation(id);
  const configFromId = useConfiguration<GraphFilterConfig>(id);
  const config = configProp ?? configFromId;
  const { data } = useFetch<GraphRow[]>(id, { data: dataProp });
  const rows = Array.isArray(data) ? data : [];

  const [values, setValues] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  if (!config) return null;

  const filtered = rows.filter((row) =>
    Object.entries(values).every(
      ([key, value]) => !value || String(delve(row, key) ?? "") === value,
    ),
  );

  const pageSize = config.pageSize;
  const totalPages = pageSize
    ? Math.max(1, Math.ceil(filtered.length / pageSize))
    : 1;
  const current = Math.min(page, totalPages);
  const paged = pageSize
    ? filtered.slice((current - 1) * pageSize, current * pageSize)
    : filtered;

  const setFilter = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const toolbar = (
    <>
      {(config.filters ?? []).map((filter) => (
        <Select
          key={filter.key}
          size="small"
          displayEmpty
          value={values[filter.key] ?? ""}
          onChange={(e) => setFilter(filter.key, e.target.value)}
          sx={selectSx}
          MenuProps={{
            slotProps: { paper: { sx: { background: "#1F1F1E" } } },
          }}
        >
          <MenuItem value="" sx={{ fontSize: 12.5 }}>
            {t(filter.label)}
          </MenuItem>
          {filter.options.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              sx={{ fontSize: 12.5 }}
            >
              {t(option.label)}
            </MenuItem>
          ))}
        </Select>
      ))}
      {pageSize && totalPages > 1 ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <Box
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            sx={{
              display: "flex",
              cursor: current === 1 ? "default" : "pointer",
              opacity: current === 1 ? 0.35 : 1,
              transform: "rotate(180deg)",
              color: "#C9C5BD",
            }}
          >
            <IconRenderer name="arrow-forward" size={17} />
          </Box>
          <Box
            sx={{
              fontSize: 12,
              color: "#7C7972",
              minWidth: 34,
              textAlign: "center",
            }}
          >
            {current} / {totalPages}
          </Box>
          <Box
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            sx={{
              display: "flex",
              cursor: current === totalPages ? "default" : "pointer",
              opacity: current === totalPages ? 0.35 : 1,
              color: "#C9C5BD",
            }}
          >
            <IconRenderer name="arrow-forward" size={17} />
          </Box>
        </Box>
      ) : null}
    </>
  );

  return (
    <GraphRenderer id={id} config={config} data={paged} toolbar={toolbar} />
  );
}
