"use client";

import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTranslation } from "@recruit/sdk";

export function AuthLoginComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  return (
    <Stack sx={{ minHeight: "100vh", alignItems: "center", justifyContent: "center", p: 3 }}>
      <Card variant="base" sx={{ width: "100%", maxWidth: 420 }}>
        <Stack spacing={1}>
          <Typography variant="h5">{t("title")}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t("subtitle")}
          </Typography>
        </Stack>
      </Card>
    </Stack>
  );
}
