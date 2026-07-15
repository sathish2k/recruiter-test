"use client";

import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import { type Cells, TableRenderer } from "@recruit/shared";
import type { EmployeeRolesConfig } from "./employee-roles.configuration";

export function EmployeeRolesComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<EmployeeRolesConfig>(id);
  const { meta } = useFetch(id);
  const totals = (meta?.totals as Record<string, unknown>) ?? {};

  const cells: Cells = {
    cvs: (row) =>
      row.cvsNew ? (
        <Chip
          variant="soft"
          color="success"
          label={t("cvsNew", { count: Number(row.cvs) })}
        />
      ) : (
        <Typography
          component="span"
          sx={{ fontSize: 13, color: "text.disabled" }}
        >
          —
        </Typography>
      ),
    nextStep: (row) => (
      <Typography
        component="span"
        sx={{ fontSize: 12.5, color: "text.secondary" }}
      >
        {t(`nextStep.${String(row.nextStepKey)}`)}
      </Typography>
    ),
  };

  return (
    <TableRenderer
      id={id}
      config={config.table}
      cells={cells}
      footerData={totals}
    />
  );
}
