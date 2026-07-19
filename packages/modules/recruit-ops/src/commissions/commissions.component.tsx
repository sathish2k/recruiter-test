"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import {
  type Cells,
  IconRenderer,
  LinkRenderer,
  StatCardRenderer,
  TableRenderer,
  Toast,
  useToast,
} from "@recruit/shared";
import { useState } from "react";
import type { CommissionsConfig } from "./commissions.configuration";

interface CommissionsData {
  period: string;
  periodLabel: string;
  kpis: {
    totalLabel: string;
    placementCount: number;
    pendingCount: number;
    pendingLabel: string;
  } & Record<string, unknown>;
  members: Record<string, unknown>[];
  placements: Record<string, unknown>[];
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <Box>
      <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{title}</Typography>
      <Typography sx={{ fontSize: 12, color: "text.secondary", mt: "2px" }}>
        {subtitle}
      </Typography>
    </Box>
  );
}

function Share({ amount, name }: { amount: string; name: string }) {
  return (
    <Box>
      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{amount}</Typography>
      <Typography sx={{ fontSize: 11.5, color: "text.disabled" }} noWrap>
        {name}
      </Typography>
    </Box>
  );
}

export function CommissionsComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<CommissionsConfig>(id);
  const { toast, show, clear } = useToast();
  const [period, setPeriod] = useState("quarter");
  const { data, mutate, mutation } = useFetch<CommissionsData>(id, {
    filters: { period },
  });

  if (!data) return null;

  const markPaid = async (rowId: string, name: string) => {
    await mutation.markPaid?.(rowId);
    await mutate();
    show(t("toast.paidTitle"), t("toast.paidSub", { name }));
  };

  const cells: Cells = {
    payout: (row) => {
      const tone = String(row.payoutTone);
      return (
        <Chip
          variant="soft"
          color={tone === "paid" ? "success" : "warning"}
          label={String(row.payoutLabel)}
        />
      );
    },
    sourcerShare: (row) => (
      <Share
        amount={String(row.sourcerAmtLabel)}
        name={String(row.sourcerName)}
      />
    ),
    leadShare: (row) => (
      <Share amount={String(row.leadAmtLabel)} name={String(row.leadName)} />
    ),
    commissionStatus: (row) =>
      row.commissionPaid ? (
        <Chip variant="soft" color="success" label={String(row.statusLabel)} />
      ) : (
        <Chip
          variant="soft"
          color="warning"
          label={t("placements.markPaid")}
          onClick={() => markPaid(String(row.id), String(row.candidateName))}
          sx={{ cursor: "pointer" }}
        />
      ),
  };

  return (
    <Box sx={{ maxWidth: 1240, mx: "auto", width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: "16px",
          flexWrap: "wrap",
          mb: "20px",
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
            {t("heading")}
          </Typography>
          <Typography sx={{ fontSize: 13, color: "text.secondary", mt: "3px" }}>
            {t("subheading", { periodLabel: data.periodLabel })}
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }} />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <Tabs
            value={period}
            onChange={(_, next) => setPeriod(next)}
            aria-label={t("toggle.period")}
          >
            <Tab value="quarter" label={t("toggle.quarter")} />
            <Tab value="year" label={t("toggle.year")} />
          </Tabs>
          <Button
            variant="outlined"
            onClick={() => show(t("toast.exportTitle"), t("toast.exportSub"))}
            startIcon={<IconRenderer name="download" size={15} />}
          >
            {t("export")}
          </Button>
          <Button
            variant="contained"
            onClick={() =>
              show(
                t("toast.payoutTitle"),
                t("toast.payoutSub", {
                  amount: data.kpis.pendingLabel,
                  count: data.kpis.pendingCount,
                }),
              )
            }
            startIcon={<IconRenderer name="payments" size={15} color="#fff" />}
          >
            {t("runPayout")}
          </Button>
        </Box>
      </Box>

      <StatCardRenderer
        id={id}
        config={config.kpiCards}
        data={data.kpis}
        gridTemplateColumns="repeat(4, 1fr)"
        gap="16px"
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          mt: "24px",
        }}
      >
        <SectionTitle
          title={t("byMember.title")}
          subtitle={t("byMember.subtitle")}
        />
        <TableRenderer
          id={id}
          config={config.byMember}
          data={data.members}
          cells={cells}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          mt: "24px",
        }}
      >
        <SectionTitle
          title={t("placements.title")}
          subtitle={t("placements.subtitle")}
        />
        <TableRenderer
          id={id}
          config={config.placements}
          data={data.placements}
          cells={cells}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "4px",
          mt: "26px",
          textAlign: "center",
        }}
      >
        <Typography sx={{ fontSize: 12, color: "text.disabled" }}>
          {t("footer.text")}
        </Typography>
        <LinkRenderer config={{ ...config.settingsLink, id }} />
      </Box>

      <Toast toast={toast} onClose={clear} />
    </Box>
  );
}
