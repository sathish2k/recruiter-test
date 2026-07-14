"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { useTranslation } from "@recruit/sdk";
import { IconRenderer } from "@recruit/shared";
import { useState } from "react";

// ponytail: resume upload + duplicate check are UI-only until parsing lands.
export function AddCandidatePanel({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const [screenNow, setScreenNow] = useState(true);

  return (
    <>
      <Card
        sx={{ p: 0, overflow: "hidden", borderColor: "rgba(242,106,27,.35)" }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "11px",
            p: "14px 18px",
            background:
              "linear-gradient(120deg,rgba(242,106,27,.3),rgba(242,106,27,.06))",
          }}
        >
          <Avatar
            variant="rounded"
            sx={{
              width: 30,
              height: 30,
              borderRadius: "9px",
              background: "linear-gradient(135deg,#FF8A3C,#E4560F)",
              color: "#fff",
            }}
          >
            <IconRenderer name="sparkle" size={16} />
          </Avatar>
          <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
            {t("panel.autofill")}
          </Typography>
        </Box>
        <Box
          sx={{
            p: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <Card
            variant="ghost"
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "9px",
              p: "26px 16px",
              borderColor: "rgba(242,106,27,.4)",
              background: "rgba(242,106,27,.05)",
            }}
          >
            <IconRenderer name="upload" size={28} color="#FF9D57" />
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
              {t("panel.drop")}
            </Typography>
            <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
              {t("panel.dropHint")}
            </Typography>
          </Card>
          <Typography
            sx={{ fontSize: 12, lineHeight: 1.55, color: "text.secondary" }}
          >
            {t("panel.autofillHint")}
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography sx={{ fontSize: 12.5, color: "#C9C5BD" }}>
              {t("panel.screenNow")}
            </Typography>
            <Switch
              checked={screenNow}
              onChange={(e) => setScreenNow(e.target.checked)}
            />
          </Box>
        </Box>
      </Card>

      <Card variant="base">
        <Typography sx={{ fontSize: 14, fontWeight: 700, mb: "10px" }}>
          {t("panel.duplicate")}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: 12.5,
            color: "#8FD6AC",
          }}
        >
          <IconRenderer name="check-circle" size={16} />
          {t("panel.noDuplicate")}
        </Box>
        <Typography sx={{ fontSize: 11.5, color: "text.disabled", mt: "8px" }}>
          {t("panel.duplicateHint")}
        </Typography>
      </Card>
    </>
  );
}
