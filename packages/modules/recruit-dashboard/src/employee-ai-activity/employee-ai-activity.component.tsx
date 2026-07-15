"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { useFetch, useTranslation } from "@recruit/sdk";
import { IconRenderer } from "@recruit/shared";

interface AiActivityRow {
  id: string;
  icon: "check" | "flag";
  key: string;
  count: number;
  role: string;
}

const ICON_COLOR: Record<AiActivityRow["icon"], string> = {
  check: "#8FD6AC",
  flag: "#F0B27C",
};

export function EmployeeAiActivityComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const { data } = useFetch<AiActivityRow[]>(id);
  const rows = data ?? [];

  return (
    <Card variant="base">
      <Box
        sx={{ display: "flex", alignItems: "center", gap: "8px", mb: "14px" }}
      >
        <IconRenderer name="sparkle" size={16} color="#F0B27C" />
        <Typography sx={{ fontSize: 14.5, fontWeight: 700 }}>
          {t("title")}
        </Typography>
      </Box>
      {rows.length === 0 ? (
        <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
          {t("empty")}
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {rows.map((row) => (
            <Box
              key={row.id}
              sx={{ display: "flex", alignItems: "flex-start", gap: "10px" }}
            >
              <IconRenderer
                name={row.icon}
                size={16}
                color={ICON_COLOR[row.icon]}
              />
              <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                {t(`activity.${row.key}`, { count: row.count, role: row.role })}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Card>
  );
}
