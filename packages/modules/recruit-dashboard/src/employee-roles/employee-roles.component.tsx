"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import { IconRenderer, LinkRenderer } from "@recruit/shared";
import type { EmployeeRolesConfig } from "./employee-roles.configuration";

interface RoleRow {
  id: string;
  title: string;
  client: string;
  clientInitial: string;
  logoBg: string;
  logoFg: string;
  invites: number;
  connected: number;
  cvs: number;
  cvsNew: boolean;
  nextStepKey: string;
}

interface RolesTotals {
  roles: number;
  invites: number;
  connected: number;
  cvs: number;
  clients: number;
}

export function EmployeeRolesComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<EmployeeRolesConfig>(id);
  const { data, meta } = useFetch<RoleRow[]>(id);
  const rows = data ?? [];
  const totals = meta?.totals as RolesTotals | undefined;

  return (
    <Card variant="base">
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          mb: "6px",
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 15.5, fontWeight: 700 }}>
            {t("title")}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "text.secondary", mt: "3px" }}>
            {t("subtitle")}
          </Typography>
        </Box>
        {config?.viewAll ? (
          <LinkRenderer config={{ ...config.viewAll, id }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: 12.5,
                fontWeight: 600,
                color: "#F0B27C",
              }}
            >
              {t("viewAll")}
              <IconRenderer name="arrow-forward" size={14} color="#F0B27C" />
            </Box>
          </LinkRenderer>
        ) : null}
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t("columns.role")}</TableCell>
            <TableCell align="right">{t("columns.invites")}</TableCell>
            <TableCell align="right">{t("columns.connected")}</TableCell>
            <TableCell align="right">{t("columns.cvs")}</TableCell>
            <TableCell>{t("columns.nextStep")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: "11px" }}
                >
                  <Avatar
                    variant="rounded"
                    sx={{
                      width: 34,
                      height: 34,
                      bgcolor: row.logoBg,
                      color: row.logoFg,
                      fontSize: 13,
                    }}
                  >
                    {row.clientInitial}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>
                      {row.title}
                    </Typography>
                    <Typography
                      sx={{ fontSize: 11.5, color: "text.secondary" }}
                    >
                      {row.client}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell align="right">{row.invites}</TableCell>
              <TableCell align="right">{row.connected}</TableCell>
              <TableCell align="right">
                {row.cvsNew ? (
                  <Chip
                    variant="soft"
                    color="success"
                    label={t("cvsNew", { count: row.cvs })}
                  />
                ) : (
                  <Typography
                    component="span"
                    sx={{ fontSize: 13, color: "text.disabled" }}
                  >
                    —
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                  {t(`nextStep.${row.nextStepKey}`)}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
          {totals ? (
            <TableRow>
              <TableCell>
                <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>
                  {t("totals", { roles: totals.roles })}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                  {totals.invites}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                  {totals.connected}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                  {totals.cvs}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                  {t("totalsClients", { clients: totals.clients })}
                </Typography>
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </Card>
  );
}
