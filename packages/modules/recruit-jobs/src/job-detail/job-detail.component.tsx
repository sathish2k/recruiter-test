"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import {
  useConfiguration,
  useFetch,
  usePortalRouter,
  useRouteParams,
  useTranslation,
} from "@recruit/sdk";
import {
  IconRenderer,
  LinkRenderer,
  markdownToHtml,
  useFormatters,
  useModal,
} from "@recruit/shared";
import delve from "dlv";
import { type ReactNode, useRef, useState } from "react";
import { JobDetailKeywords, type JobKeywords } from "./job-detail-keywords";
import type { JobDetailConfig } from "./job-detail.configuration";

interface TeamMember {
  name: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  role: string;
  badge: string;
  badgeTone: string;
}

interface JobDetail {
  id: string;
  title: string;
  roleCat: string;
  client: string;
  location: string;
  empType: string;
  level: string;
  openings: number;
  status: string;
  salary: string;
  description: string;
  skills: string[];
  expYears: string;
  workType: string;
  qualifications: string[];
  responsibilities: string[];
  posting: {
    creationDate: string;
    recruitmentPeriod: string;
    totalApplicants: number;
    quota: number;
    quotaNote: string;
    views: number;
    saves: number;
    lastUpdate: string;
  };
  team: TeamMember[];
  screening: {
    on: boolean;
    screened: number;
    total: number;
    matched80: number;
    threshold: number;
  };
  keywords: JobKeywords;
}

const MARKDOWN_RX = /(^|\n)(#{1,3} |[-*] |\d+\. |> )|\*\*/;

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Typography sx={{ fontSize: 16, fontWeight: 700, mb: "10px" }}>
      {children}
    </Typography>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <Box
      component="ul"
      sx={{
        m: 0,
        pl: "22px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        fontSize: 14,
        lineHeight: 1.6,
        color: "#C9C5BD",
        maxWidth: 840,
      }}
    >
      {items.map((item) => (
        <Box component="li" key={item}>
          {item}
        </Box>
      ))}
    </Box>
  );
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Box>
      <Typography sx={{ fontSize: 12, color: "text.secondary", mb: "4px" }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{value}</Typography>
    </Box>
  );
}

function StatRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: ReactNode;
  accent?: boolean;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: 12.5,
        color: "#C9C5BD",
      }}
    >
      <span>{label}</span>
      <Box
        component="span"
        sx={
          accent
            ? { color: "#FF9D57", fontWeight: 700 }
            : { color: "text.primary", fontWeight: 600 }
        }
      >
        {value}
      </Box>
    </Box>
  );
}

export function JobDetailComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<JobDetailConfig>(id);
  const router = usePortalRouter();
  const { formatNumber } = useFormatters();
  const { id: jobId } = useRouteParams();
  const {
    data: job,
    error,
    isLoading,
  } = useFetch<JobDetail>(id, {
    filters: { id: jobId },
  });
  const keywordsModal = useModal();
  const [shared, setShared] = useState(false);
  const shareTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!config || isLoading) return null;
  if (error || !job) {
    const notFound =
      (error as { response?: { status?: number } })?.response?.status === 404;
    return (
      <Card variant="base">
        <Typography sx={{ fontSize: 13.5, color: "text.secondary" }}>
          {t(notFound ? "notFound" : "loadError")}
        </Typography>
      </Card>
    );
  }

  const shareLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    if (shareTimer.current) clearTimeout(shareTimer.current);
    setShared(true);
    shareTimer.current = setTimeout(
      () => setShared(false),
      config.keywords.copyResetMs,
    );
  };

  const isMarkdown = MARKDOWN_RX.test(job.description);
  const bodySx = {
    fontSize: 14,
    lineHeight: 1.7,
    color: "#C9C5BD",
    maxWidth: 840,
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "minmax(0,1fr) 350px" },
        gap: "24px",
        alignItems: "start",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <LinkRenderer config={config.backLink}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              <IconRenderer name="arrow-back" size={18} />
              {t("back")}
            </Box>
          </LinkRenderer>
          <Box sx={{ display: "flex", gap: "8px" }}>
            <Chip
              clickable
              variant="soft"
              color="primary"
              icon={<IconRenderer name="manage-search" size={16} />}
              label={t("actions.keywords")}
              title={t("actions.keywordsTitle")}
              onClick={() => keywordsModal.open()}
              sx={{
                height: 37,
                px: "6px",
                fontSize: 13,
                "& .MuiChip-icon": { color: "inherit" },
              }}
            />
            <Button
              variant="outlined"
              startIcon={<IconRenderer name="edit" size={16} />}
              onClick={() => router.push(config.editRouteId)}
            >
              {t("actions.edit")}
            </Button>
            <Button
              variant="outlined"
              startIcon={
                <IconRenderer name={shared ? "check" : "share"} size={16} />
              }
              onClick={shareLink}
              sx={shared ? { color: "success.light" } : undefined}
            >
              {t(shared ? "actions.linkCopied" : "actions.share")}
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "20px",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Avatar
              variant="rounded"
              sx={{
                width: 64,
                height: 64,
                borderRadius: "16px",
                background: "linear-gradient(135deg,#FF8A3C,#E4560F)",
                color: "#fff",
              }}
            >
              <IconRenderer name="work" size={30} />
            </Avatar>
            <Box>
              <Typography
                sx={{ fontSize: 24, fontWeight: 700, letterSpacing: "-.015em" }}
              >
                {job.title}
              </Typography>
              <Typography
                sx={{ fontSize: 13.5, color: "text.secondary", mt: "5px" }}
              >
                {[job.roleCat, job.client].filter(Boolean).join(" · ")}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography
              sx={{ fontSize: 21, fontWeight: 700, letterSpacing: "-.01em" }}
            >
              {job.salary}
            </Typography>
            <Typography
              sx={{ fontSize: 13, color: "text.secondary", mt: "5px" }}
            >
              {job.location}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr 1fr",
              md: "repeat(4,1fr)",
            },
            gap: "12px",
          }}
        >
          {config.attributes.map((attr) => {
            const raw = String(
              delve(job as unknown as Record<string, unknown>, attr.path) ?? "",
            );
            const value = attr.translatePrefix
              ? t(`${attr.translatePrefix}.${raw}`, raw)
              : raw;
            return (
              <Box
                key={attr.path}
                sx={{
                  background: "rgba(242,106,27,.08)",
                  border: "1px solid rgba(242,106,27,.2)",
                  borderRadius: "13px",
                  p: "14px 16px",
                  textAlign: "center",
                }}
              >
                <Typography
                  sx={{ fontSize: 12, color: "text.secondary", mb: "6px" }}
                >
                  {t(attr.label)}
                </Typography>
                <Typography sx={{ fontSize: 14.5, fontWeight: 700 }}>
                  {value}
                </Typography>
              </Box>
            );
          })}
        </Box>

        <Box>
          <SectionTitle>{t("sections.description")}</SectionTitle>
          {isMarkdown ? (
            <Box
              sx={bodySx}
              // biome-ignore lint/security/noDangerouslySetInnerHtml: markdownToHtml escapes its input.
              dangerouslySetInnerHTML={{
                __html: markdownToHtml(job.description),
              }}
            />
          ) : (
            <Typography sx={bodySx}>{job.description}</Typography>
          )}
        </Box>

        {job.qualifications.length ? (
          <Box>
            <SectionTitle>{t("sections.qualifications")}</SectionTitle>
            <BulletList items={job.qualifications} />
          </Box>
        ) : null}

        {job.responsibilities.length ? (
          <Box>
            <SectionTitle>{t("sections.responsibilities")}</SectionTitle>
            <BulletList items={job.responsibilities} />
          </Box>
        ) : null}

        {job.skills.length ? (
          <Box>
            <SectionTitle>{t("sections.skills")}</SectionTitle>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {job.skills.map((skill) => (
                <Chip
                  key={skill}
                  variant="soft"
                  color="default"
                  label={skill}
                />
              ))}
            </Box>
          </Box>
        ) : null}
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Card variant="base">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: "14px",
            }}
          >
            <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
              {t("team.title")}
            </Typography>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 600,
                color: "primary.light",
                cursor: "pointer",
              }}
            >
              {t("team.change")}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {job.team.map((member) => (
              <Box
                key={member.name}
                sx={{ display: "flex", alignItems: "center", gap: "11px" }}
              >
                <Avatar
                  sx={{
                    width: 34,
                    height: 34,
                    bgcolor: member.avatarBg,
                    color: member.avatarFg,
                    fontSize: 11.5,
                  }}
                >
                  {member.initials}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                    {member.name}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: "text.disabled" }}>
                    {member.role}
                  </Typography>
                </Box>
                <Chip
                  variant="soft"
                  color={member.badgeTone === "success" ? "success" : "primary"}
                  size="small"
                  label={member.badge}
                  sx={{ fontSize: 11 }}
                />
              </Box>
            ))}
          </Box>
        </Card>

        <Card variant="base" sx={{ p: "22px" }}>
          <Typography sx={{ fontSize: 16.5, fontWeight: 700, mb: "18px" }}>
            {t("posting.title")}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Box>
              <Typography
                sx={{ fontSize: 12, color: "text.secondary", mb: "6px" }}
              >
                {t("posting.status")}
              </Typography>
              <Chip
                variant="soft"
                color={config.statusTones[job.status] ?? "default"}
                size="small"
                label={job.status}
                icon={
                  <Box
                    component="span"
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: "currentColor",
                      ml: "6px",
                    }}
                  />
                }
                sx={{ "& .MuiChip-icon": { color: "inherit" } }}
              />
            </Box>
            <Field
              label={t("posting.creationDate")}
              value={job.posting.creationDate}
            />
            <Field
              label={t("posting.recruitmentPeriod")}
              value={job.posting.recruitmentPeriod}
            />
            <Box>
              <Typography
                sx={{ fontSize: 12, color: "text.secondary", mb: "4px" }}
              >
                {t("posting.totalApplicants")}
              </Typography>
              <Box
                sx={{ display: "flex", alignItems: "baseline", gap: "10px" }}
              >
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                  {formatNumber(job.posting.totalApplicants)}
                </Typography>
                <LinkRenderer config={config.pipelineLink} />
              </Box>
            </Box>
            <Field
              label={t("posting.quota")}
              value={t("posting.quotaValue", {
                quota: job.posting.quota,
                note: job.posting.quotaNote,
              })}
            />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <Field
                label={t("posting.views")}
                value={formatNumber(job.posting.views)}
              />
              <Field
                label={t("posting.saves")}
                value={formatNumber(job.posting.saves)}
              />
            </Box>
            <Field
              label={t("posting.lastUpdate")}
              value={job.posting.lastUpdate}
            />
          </Box>
        </Card>

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
            <Typography sx={{ fontSize: 14, fontWeight: 700, flex: 1 }}>
              {t("screening.title")}
            </Typography>
            <Chip
              variant="soft"
              color={job.screening.on ? "success" : "default"}
              size="small"
              label={t(job.screening.on ? "screening.on" : "screening.off")}
            />
          </Box>
          <Box
            sx={{
              p: "14px 18px",
              display: "flex",
              flexDirection: "column",
              gap: "9px",
            }}
          >
            <StatRow
              label={t("screening.screened")}
              value={t("screening.screenedValue", {
                screened: formatNumber(job.screening.screened),
                total: formatNumber(job.screening.total),
              })}
            />
            <StatRow
              label={t("screening.matched", {
                threshold: job.screening.threshold,
              })}
              value={formatNumber(job.screening.matched80)}
              accent
            />
            <StatRow
              label={t("screening.threshold")}
              value={`${job.screening.threshold}%`}
            />
          </Box>
        </Card>
      </Box>

      <JobDetailKeywords
        id={id}
        open={keywordsModal.isOpen}
        onClose={keywordsModal.close}
        config={config.keywords}
        jobTitle={job.title}
        client={job.client}
        keywords={job.keywords}
      />
    </Box>
  );
}
