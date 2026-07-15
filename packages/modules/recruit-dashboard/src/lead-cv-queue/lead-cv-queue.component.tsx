"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import { IconRenderer, Toast, useToast } from "@recruit/shared";
import { useState } from "react";
import type { LeadCvQueueConfig } from "./lead-cv-queue.configuration";

interface CvQueueRow {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  role: string;
  client: string;
  when: string;
  score: number;
  scoreColor: string;
  sourcer: string;
  sourcerInitials: string;
  sourcerBg: string;
  sourcerFg: string;
}

export function LeadCvQueueComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<LeadCvQueueConfig>(id);
  const { data } = useFetch<CvQueueRow[]>(id);
  const toast = useToast();
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());

  const rows = data ?? [];
  const threshold = config?.submitThreshold ?? 85;
  const pending = rows.filter((row) => !submitted.has(row.id));
  const allCaughtUp = rows.length > 0 && pending.length === 0;

  const submit = (row: CvQueueRow) => {
    setSubmitted((prev) => new Set(prev).add(row.id));
    toast.show(
      t("toast.submitted", { name: row.name }),
      t("toast.submittedSub"),
    );
  };

  const submitAll = () => {
    const next = new Set(submitted);
    for (const row of rows) {
      if (row.score >= threshold) next.add(row.id);
    }
    setSubmitted(next);
    toast.show(
      t("toast.submittedAll"),
      t("toast.submittedAllSub", { threshold }),
    );
  };

  return (
    <Card variant="base">
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          mb: "18px",
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
        <Button
          variant="contained"
          color="secondary"
          onClick={submitAll}
          disabled={allCaughtUp}
          startIcon={<IconRenderer name="done_all" size={15} />}
          sx={{ fontSize: 12.5 }}
        >
          {t("submitAll", { threshold })}
        </Button>
      </Box>

      {allCaughtUp ? (
        <Box sx={{ textAlign: "center", py: "36px" }}>
          <IconRenderer name="task_alt" size={34} color="#8FD6AC" />
          <Typography sx={{ fontSize: 15, fontWeight: 700, mt: "12px" }}>
            {t("empty.title")}
          </Typography>
          <Typography
            sx={{ fontSize: 12.5, color: "text.secondary", mt: "4px" }}
          >
            {t("empty.subtitle")}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {rows.map((row) => {
            const isSubmitted = submitted.has(row.id);
            return (
              <Card
                key={row.id}
                variant="inset"
                sx={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1.4fr 1fr auto",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: "11px" }}
                >
                  <Avatar
                    sx={{
                      width: 38,
                      height: 38,
                      bgcolor: row.avatarBg,
                      color: row.avatarFg,
                      fontSize: 13,
                    }}
                  >
                    {row.initials}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>
                      {row.name}
                    </Typography>
                    <Typography
                      sx={{ fontSize: 11.5, color: "text.secondary" }}
                    >
                      {t("rowMeta", {
                        role: row.role,
                        client: row.client,
                        when: row.when,
                      })}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: "5px",
                    }}
                  >
                    <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                      {t("aiMatch")}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: row.scoreColor,
                      }}
                    >
                      {row.score}%
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      height: 6,
                      borderRadius: "999px",
                      background: "rgba(255,255,255,.08)",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        width: `${row.score}%`,
                        height: "100%",
                        borderRadius: "999px",
                        background: "linear-gradient(90deg,#FF8A3C,#C24509)",
                      }}
                    />
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Avatar
                    sx={{
                      width: 24,
                      height: 24,
                      bgcolor: row.sourcerBg,
                      color: row.sourcerFg,
                      fontSize: 9.5,
                    }}
                  >
                    {row.sourcerInitials}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{ fontSize: 10.5, color: "text.secondary" }}
                    >
                      {t("sourcedBy")}
                    </Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
                      {row.sourcer}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <IconButton title={t("reviewPdf")}>
                    <IconRenderer name="pdf" size={16} />
                  </IconButton>
                  {isSubmitted ? (
                    <Button
                      variant="outlined"
                      disabled
                      startIcon={<IconRenderer name="check" size={14} />}
                      sx={{ fontSize: 12 }}
                    >
                      {t("submitted")}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={() => submit(row)}
                      sx={{ fontSize: 12 }}
                    >
                      {t("submit")}
                    </Button>
                  )}
                </Box>
              </Card>
            );
          })}
        </Box>
      )}
      <Toast toast={toast.toast} onClose={toast.clear} />
    </Card>
  );
}
