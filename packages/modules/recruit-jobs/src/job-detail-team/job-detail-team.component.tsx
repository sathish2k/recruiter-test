"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import {
  useConfiguration,
  useFetch,
  usePortalRouter,
  useRouteParams,
  useTranslation,
} from "@recruit/sdk";
import { EntityRenderer } from "@recruit/shared";
import type { JobDetailTeamConfiguration } from "./job-detail-team.configuration";

interface Member {
  id: string;
  name: string;
  role: "sourcer" | "profileLead";
  metric: number;
}

/** The rail's assigned-team card: who owns the requirement, and the one number
 * each of them is measured on. */
export function JobDetailTeamComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<JobDetailTeamConfiguration>(id);
  const params = useRouteParams();
  const router = usePortalRouter();
  const { data, isLoading } = useFetch<{ members: Member[] }>(id, { filters: { id: params.id } });

  const members = data?.members ?? [];

  return (
    <Card variant="base" sx={{ p: "18px 20px" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: "14px",
        }}
      >
        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{t("title")}</Typography>
        <Typography
          component="button"
          type="button"
          onClick={() => router.push(config.editRouteId, { id: String(params.id ?? "") })}
          sx={{
            fontSize: 12,
            fontWeight: 600,
            color: "surface.primarySoftFg",
            background: "none",
            border: 0,
            p: 0,
            cursor: "pointer",
          }}
        >
          {t("change")}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {isLoading ? (
          [0, 1].map((row) => <Skeleton key={row} variant="rounded" height={34} />)
        ) : members.length ? (
          members.map((member) => (
            <Box key={member.role} sx={{ display: "flex", alignItems: "center", gap: "11px" }}>
              <EntityRenderer
                config={{
                  type: "entity",
                  shape: "circle",
                  size: 34,
                  hashPath: "name",
                  title: "name",
                  avatarOnly: true,
                }}
                data={{ name: member.name }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{member.name}</Typography>
                <Typography sx={{ fontSize: 11, color: "text.disabled" }}>
                  {t(`roles.${member.role}`)}
                </Typography>
              </Box>
              <Chip
                variant="soft"
                color={member.role === "sourcer" ? "success" : "primary"}
                size="small"
                label={t(`metrics.${member.role}`, { count: member.metric })}
              />
            </Box>
          ))
        ) : (
          <Typography sx={{ fontSize: 12.5, color: "text.disabled" }}>{t("empty")}</Typography>
        )}
      </Box>
    </Card>
  );
}
