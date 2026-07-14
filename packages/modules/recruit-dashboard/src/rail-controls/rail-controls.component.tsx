"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import {
  useConfiguration,
  usePortalRouter,
  useTranslation,
} from "@recruit/sdk";
import { IconRenderer, SearchField } from "@recruit/shared";
import { useState } from "react";

export function RailControlsComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<{ scheduleRouteId?: string }>(id);
  const router = usePortalRouter();
  const [q, setQ] = useState("");
  const [range, setRange] = useState<"today" | "week">("today");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      <SearchField
        value={q}
        onChange={setQ}
        placeholder={t("search")}
        sx={{ width: "100%" }}
      />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Tabs value={range} onChange={(_, next) => setRange(next)}>
          <Tab
            value="today"
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "999px",
                    bgcolor: "primary.light",
                  }}
                />
                {t("today")}
              </Box>
            }
          />
          <Tab value="week" label={t("week")} />
        </Tabs>
        <Button
          variant="contained"
          startIcon={<IconRenderer name="add" size={15} />}
          onClick={() =>
            config?.scheduleRouteId && router.push(config.scheduleRouteId)
          }
        >
          {t("schedule")}
        </Button>
      </Box>
    </Box>
  );
}
