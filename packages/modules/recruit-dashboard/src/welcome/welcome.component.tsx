"use client";

import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useFetch } from "@recruit/sdk";

interface HomeDashboard {
  greeting: string;
  stats: { openRoles: number; activeCandidates: number };
}

export function WelcomeComponent({
  id,
  translation,
}: {
  id: string;
  translation?: { fallback?: { title?: string; subtitle?: string } };
}) {
  const t = translation?.fallback;
  const { data, isLoading } = useFetch<HomeDashboard>(id);

  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Stack spacing={3} sx={{ alignItems: "flex-start" }}>
        <Typography variant="h3" sx={{ fontWeight: 700 }}>
          {t?.title ?? "AI Recruiter"}
        </Typography>
        <Typography color="text.secondary">
          {data?.greeting ?? t?.subtitle ?? "Config-driven engine is live."}
        </Typography>
        {data?.stats ? (
          <Stack direction="row" spacing={4}>
            <Typography>
              Open roles: <strong>{data.stats.openRoles}</strong>
            </Typography>
            <Typography>
              Active candidates: <strong>{data.stats.activeCandidates}</strong>
            </Typography>
          </Stack>
        ) : null}
        <Button variant="contained" loading={isLoading}>
          Get started
        </Button>
      </Stack>
    </Container>
  );
}
