"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, usePortalRouter, useTranslation } from "@recruit/sdk";
import { IconRenderer, LinkRenderer } from "@recruit/shared";
import { CardHeader } from "../ui";
import type { RolesSummaryConfig } from "./roles-summary.configuration";

interface Holder {
  count: number;
}

/**
 * What each role means and how many people hold it — the last block of the
 * users screen, and the way across to the matrix that decides the rest. Counts
 * come from the permission API's holders, the same numbers the matrix's role
 * cards print, so the two screens can never disagree.
 */
export function RolesSummaryComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<RolesSummaryConfig>(id);
  const router = usePortalRouter();
  const { meta } = useFetch(id);

  const holders = (meta?.holders as Record<string, Holder> | undefined) ?? {};

  return (
    <Card variant="base" sx={{ p: "22px 24px" }}>
      <CardHeader
        title={t("title")}
        action={
          <LinkRenderer
            config={{
              ...config.action,
              text: t(config.action.text ?? ""),
              sx: { fontSize: 12.5, fontWeight: 700 },
            }}
          />
        }
      />
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {config.roles.map((role) => {
          const count = holders[role]?.count ?? 0;
          return (
            <Box
              key={role}
              onClick={() => router.push(config.rolesRouteId)}
              sx={{
                display: "grid",
                gridTemplateColumns: "150px minmax(0,1fr) 96px 24px",
                gap: "16px",
                alignItems: "center",
                p: "12px 10px",
                mx: "-10px",
                borderRadius: "8px",
                cursor: "pointer",
                borderBottom: "1px dashed",
                borderColor: "surface.divider",
                "&:last-of-type": { borderBottom: "none" },
                "&:hover": { bgcolor: "surface.hover" },
              }}
            >
              <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{t(`roles.${role}`)}</Typography>
              <Typography sx={{ fontSize: 12.5, lineHeight: 1.6, color: "text.disabled" }}>
                {t(`roleDetail.${role}`)}
              </Typography>
              <Typography
                sx={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  textAlign: "right",
                  whiteSpace: "nowrap",
                  color: "text.secondary",
                }}
              >
                {t("members", { count })}
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "flex-end", color: "text.disabled" }}>
                <IconRenderer name="chevron-right" size={17} color="inherit" />
              </Box>
            </Box>
          );
        })}
      </Box>
    </Card>
  );
}
