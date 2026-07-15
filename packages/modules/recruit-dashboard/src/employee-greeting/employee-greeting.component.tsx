"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useFetch, useTranslation } from "@recruit/sdk";

interface Greeting {
  firstName: string;
  invitesSent: number;
  invitesTarget: number;
  cvsReceived: number;
}

export function EmployeeGreetingComponent({ id }: { id: string }) {
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
          invitesSent: data.invitesSent,
          invitesTarget: data.invitesTarget,
          cvsReceived: data.cvsReceived,
        })}
      </Typography>
    </Box>
  );
}
