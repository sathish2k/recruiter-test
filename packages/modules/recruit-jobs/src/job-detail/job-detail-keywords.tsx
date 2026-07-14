"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { useTranslation } from "@recruit/sdk";
import { IconRenderer, Modal } from "@recruit/shared";
import { useRef, useState } from "react";
import type { JobDetailConfig } from "./job-detail.configuration";

export interface JobKeywords {
  titles: string[];
  linkedin: string;
  naukri: string;
}

type BoardKind = "linkedin" | "naukri";

interface Board {
  kind: BoardKind;
  badge: string;
  badgeBg: string;
  badgeFg: string;
  title: string;
  hint: string;
  text: string;
}

export function JobDetailKeywords({
  id,
  open,
  onClose,
  config,
  jobTitle,
  client,
  keywords,
}: {
  id: string;
  open: boolean;
  onClose: () => void;
  config: JobDetailConfig["keywords"];
  jobTitle: string;
  client: string;
  keywords: JobKeywords;
}) {
  const { t } = useTranslation(id);
  const [copied, setCopied] = useState<BoardKind | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = (kind: BoardKind, text: string) => {
    navigator.clipboard?.writeText(text);
    if (timer.current) clearTimeout(timer.current);
    setCopied(kind);
    timer.current = setTimeout(() => setCopied(null), config.copyResetMs);
  };

  const boards: Board[] = [
    {
      kind: "linkedin",
      badge: t("keywordsModal.linkedinBadge"),
      badgeBg: "#2E4B6B",
      badgeFg: "#BDD7F2",
      title: t("keywordsModal.linkedinTitle"),
      hint: t("keywordsModal.linkedinHint"),
      text: keywords.linkedin,
    },
    {
      kind: "naukri",
      badge: t("keywordsModal.naukriBadge"),
      badgeBg: "#4A5B3A",
      badgeFg: "#E0F5CF",
      title: t("keywordsModal.naukriTitle"),
      hint: t("keywordsModal.naukriHint"),
      text: keywords.naukri,
    },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={config.modalWidth}
      title={t("keywordsModal.title")}
      description={t("keywordsModal.subtitle", { title: jobTitle, client })}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: "7px",
            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              fontSize: 11,
              letterSpacing: ".08em",
              color: "text.disabled",
              mr: "3px",
            }}
          >
            {t("keywordsModal.searchAs")}
          </Typography>
          {keywords.titles.map((title, i) => (
            <Chip
              key={title}
              variant="soft"
              color={i === 0 ? "primary" : "default"}
              size="small"
              label={title}
            />
          ))}
        </Box>
        {boards.map((b) => (
          <Card key={b.kind} variant="inset" sx={{ p: 0, overflow: "hidden" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                p: "11px 16px",
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Avatar
                variant="rounded"
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: "7px",
                  bgcolor: b.badgeBg,
                  color: b.badgeFg,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {b.badge}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>
                  {b.title}
                </Typography>
                <Typography sx={{ fontSize: 10.5, color: "text.disabled" }}>
                  {b.hint}
                </Typography>
              </Box>
              <Chip
                clickable
                variant="soft"
                color={copied === b.kind ? "success" : "default"}
                size="small"
                icon={<IconRenderer name="copy" size={13} />}
                label={t(
                  copied === b.kind
                    ? "keywordsModal.copied"
                    : "keywordsModal.copy",
                )}
                onClick={() => copy(b.kind, b.text)}
                sx={{
                  fontWeight: 700,
                  "& .MuiChip-icon": { color: "inherit" },
                }}
              />
            </Box>
            <Typography
              sx={{
                p: "13px 16px",
                fontSize: 12,
                lineHeight: 1.75,
                fontFamily: "ui-monospace,Menlo,monospace",
                wordBreak: "break-word",
                color: "#D9D5CD",
              }}
            >
              {b.text}
            </Typography>
          </Card>
        ))}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            borderTop: "1px solid",
            borderColor: "divider",
            pt: "15px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flex: 1,
              fontSize: 11.5,
              lineHeight: 1.5,
              color: "text.secondary",
            }}
          >
            <IconRenderer name="sparkle" size={14} color="#FF9D57" />
            {t("keywordsModal.regenerates")}
          </Box>
          <Button
            variant="contained"
            component="a"
            href={
              config.linkedinSearchUrl + encodeURIComponent(keywords.linkedin)
            }
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<IconRenderer name="open-in-new" size={14} />}
            sx={{ fontSize: 12 }}
          >
            {t("keywordsModal.searchOnLinkedin")}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
