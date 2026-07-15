"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useFetch, useTranslation } from "@recruit/sdk";

interface Greeting {
  firstName: string;
  cvsWaiting: number;
  approvals: number;
}

export function LeadGreetingComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const { data } = useFetch<Greeting>(id);
  if (!data) return null;

  return (
    <Box>
      <Typography
        sx={{ fontSize: 26, fontWeight: 700, letterSpacing: "-.01em" }}
      >
        {t("greeting", { name: data.firstName })}
      </Typography>
      <Typography sx={{ fontSize: 13.5, color: "text.secondary", mt: "6px" }}>
        {t("summary", {
          cvs: data.cvsWaiting,
          approvals: data.approvals,
        })}
      </Typography>
    </Box>
  );
}
