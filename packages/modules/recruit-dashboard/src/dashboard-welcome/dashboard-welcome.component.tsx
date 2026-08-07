"use client";

import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { useAuthUser, useFetch, useTranslation } from "@recruit/sdk";
import { seedRecord } from "@recruit/shared";
import type { DashboardWelcomeConfig } from "./dashboard-welcome.configuration";

function greetingKey(config: DashboardWelcomeConfig) {
  const hour = new Date().getHours();
  if (hour < 12) return config.greeting.morning;
  if (hour < 18) return config.greeting.afternoon;
  return config.greeting.evening;
}

function firstName(name?: string | null) {
  return (name ?? "").trim().split(/\s+/)[0] ?? "";
}

export function DashboardWelcomeComponent({
  id,
  configuration,
  data: seed,
}: {
  id: string;
  configuration?: DashboardWelcomeConfig;
  data?: Record<string, unknown>;
}) {
  const { t } = useTranslation(id);
  const user = useAuthUser();
  const { data, isLoading } = useFetch<Record<string, unknown>>(id, { data: seedRecord(seed) });
  const summary = data ?? {};

  if (!configuration) return null;

  const name = firstName(user?.name);
  const greeting = t(greetingKey(configuration));
  const key = summary.isNewWorkspace ? configuration.emptySubtitle : configuration.subtitle;

  return (
    <Box>
      <Typography
        suppressHydrationWarning
        sx={{
          fontFamily: "var(--font-grotesk), 'Space Grotesk', system-ui, sans-serif",
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: "-.01em",
        }}
      >
        {name ? `${greeting}, ${name}` : greeting}
      </Typography>
      {isLoading ? (
        <Skeleton variant="text" width={280} height={16} sx={{ mt: "3px" }} />
      ) : (
        <Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: "3px" }}>
          {t(key, summary)}
        </Typography>
      )}
    </Box>
  );
}
