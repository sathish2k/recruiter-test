"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useFetch } from "@recruit/sdk";
import { useState } from "react";
import { Field, Row, SectionCard, Toggle } from "../ui";

interface Organization {
  id: string;
  name: string;
}

export function SettingsWorkspaceComponent({ id }: { id: string }) {
  // The session only carries the organization id — read the record for its name.
  const { data: organization } = useFetch<Organization>(id);
  const agency = organization?.name ?? "—";
  const [whiteLabel, setWhiteLabel] = useState(true);

  return (
    <Box sx={{ maxWidth: 1100, display: "flex", flexDirection: "column", gap: "16px" }}>
      <SectionCard>
        <Typography sx={{ fontSize: 14.5, fontWeight: 700, mb: "16px" }}>Agency profile</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Field label="Agency name" value={agency} />
          <Field label="Website" value="—" muted />
          <Field label="Timezone" value="IST (GMT+5:30)" muted />
          <Field label="Default placement fee" value="8.33% of annual CTC" />
        </Box>
      </SectionCard>
      <SectionCard>
        <Typography sx={{ fontSize: 14.5, fontWeight: 700, mb: "4px" }}>
          Client report branding
        </Typography>
        <Typography sx={{ fontSize: 12, color: "text.disabled", mb: "8px" }}>
          How the weekly digest looks to clients
        </Typography>
        <Row
          title="White-label reports"
          desc="Show your logo instead of “Powered by HirePilotX”"
          action={<Toggle on={whiteLabel} onClick={() => setWhiteLabel((v) => !v)} />}
        />
      </SectionCard>
    </Box>
  );
}
