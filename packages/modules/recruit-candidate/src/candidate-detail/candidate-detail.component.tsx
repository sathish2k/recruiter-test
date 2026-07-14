"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import OutlinedInput from "@mui/material/OutlinedInput";
import {
  useConfiguration,
  useFetch,
  useRouteParams,
  useTranslation,
} from "@recruit/sdk";
import { IconRenderer, LinkRenderer } from "@recruit/shared";
import { type ReactNode, useState } from "react";
import type { CandidateDetailConfig } from "./candidate-detail.configuration";

interface IconRow {
  icon: string;
  text: string;
}

interface TimelineStage {
  name: string;
  sub: string;
  state: "done" | "current" | "future";
}

interface CandidateDetail {
  name: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  match: number;
  headline: string;
  heroMeta: IconRow[];
  report: {
    score: number;
    verdict: string;
    verdictTone: "success" | "warning" | "default";
    subtitle: string;
    bars: { label: string; score: number }[];
    strengths: string[];
    gaps: string[];
  };
  timeline: TimelineStage[];
  experience: {
    title: string;
    company: string;
    period: string;
    blurb: string;
  }[];
  education: { icon: string; title: string; sub: string }[];
  skills: string[];
  requiredSkills: string[];
  details: IconRow[];
  attachments: {
    icon: string;
    color: string;
    title: string;
    sub: string;
    action: string;
  }[];
  appliedJob: {
    title: string;
    meta: string;
    initial: string;
    bg: string;
    fg: string;
  };
  interviews: { title: string; when: string; state: string; badge?: string }[];
  teamNotes: {
    initials: string;
    avatarBg: string;
    avatarFg: string;
    text: string;
    author: string;
    when: string;
  }[];
  noteAuthor: {
    initials: string;
    avatarBg: string;
    avatarFg: string;
    name: string;
  };
}

interface LocalNote {
  key: string;
  text: string;
}

const ORANGE_GRADIENT = "linear-gradient(135deg,#FF8A3C,#E4560F)";
const GREEN = "#4EA874";
const FUTURE_LINE = "rgba(255,255,255,.1)";

const NODE_STYLES = {
  done: { bg: GREEN, border: GREEN, fg: "#8FD6AC", glow: "none" },
  current: {
    bg: ORANGE_GRADIENT,
    border: "#FF8A3C",
    fg: "#FFD9BC",
    glow: "0 0 14px rgba(242,106,27,.6)",
  },
  future: {
    bg: "#1C1C1B",
    border: "rgba(255,255,255,.2)",
    fg: "#7C7972",
    glow: "none",
  },
} as const;

function SectionTitle({ text, mb = "16px" }: { text: string; mb?: string }) {
  return <Box sx={{ fontSize: 15, fontWeight: 700, mb }}>{text}</Box>;
}

function MatchRing({
  size,
  score,
  children,
}: {
  size: number;
  score: number;
  children: ReactNode;
}) {
  const deg = Math.max(0, Math.min(100, score)) * 3.6;
  return (
    <Box sx={{ position: "relative", width: size, height: size, flex: "none" }}>
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          borderRadius: 999,
          background: `conic-gradient(#FF8A3C 0deg,#E4560F ${deg}deg,rgba(255,255,255,.1) ${deg}deg)`,
        }}
      />
      {children}
    </Box>
  );
}

function TimelineStrip({ stages }: { stages: TimelineStage[] }) {
  const curIdx = stages.findIndex((s) => s.state === "current");
  return (
    <Box
      sx={{
        borderTop: "1px solid",
        borderColor: "divider",
        background: "rgba(0,0,0,.25)",
        p: "18px 24px 16px",
        display: "flex",
        alignItems: "flex-start",
      }}
    >
      {stages.map((stage, i) => {
        const node = NODE_STYLES[stage.state];
        const lineL =
          i === 0 ? "transparent" : i <= curIdx ? GREEN : FUTURE_LINE;
        const lineR =
          i === stages.length - 1
            ? "transparent"
            : i < curIdx
              ? GREEN
              : FUTURE_LINE;
        return (
          <Box
            key={stage.name}
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
              <Box sx={{ flex: 1, height: "2.5px", background: lineL }} />
              <Box
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  background: node.bg,
                  border: `2px solid ${node.border}`,
                  boxShadow: node.glow,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: "none",
                }}
              >
                {stage.state === "done" ? (
                  <IconRenderer name="check" size={13} color="#0F1F16" />
                ) : stage.state === "current" ? (
                  <IconRenderer name="hourglass" size={13} color="#fff" />
                ) : null}
              </Box>
              <Box sx={{ flex: 1, height: "2.5px", background: lineR }} />
            </Box>
            <Box
              sx={{ fontSize: 12, fontWeight: 600, color: node.fg, mt: "8px" }}
            >
              {stage.name}
            </Box>
            <Box sx={{ fontSize: 11, color: "text.disabled", mt: "2px" }}>
              {stage.sub}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

export function CandidateDetailComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<CandidateDetailConfig>(id);
  const params = useRouteParams();
  const { data } = useFetch<CandidateDetail>(id, {
    filters: { id: params.id ?? "" },
  });
  const [noteText, setNoteText] = useState("");
  const [localNotes, setLocalNotes] = useState<LocalNote[]>([]);

  if (!data || !config) return null;

  // ponytail: notes are session-local — no persistence endpoint yet.
  const addNote = () => {
    const text = noteText.trim();
    if (!text) return;
    setLocalNotes((notes) => [{ key: crypto.randomUUID(), text }, ...notes]);
    setNoteText("");
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "minmax(0,1fr) 350px" },
        gap: "20px",
        alignItems: "start",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          minWidth: 0,
        }}
      >
        <LinkRenderer config={config.backLink}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              fontSize: 12.5,
              fontWeight: 600,
              color: "text.secondary",
              width: "fit-content",
              "&:hover": { color: "primary.light" },
            }}
          >
            <IconRenderer name="arrow-back" size={15} />
            {t("back")}
          </Box>
        </LinkRenderer>

        <Card variant="feature" sx={{ p: 0, overflow: "hidden" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
              p: "22px 24px 20px",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: "18px" }}>
              <Box
                sx={{
                  position: "relative",
                  width: 68,
                  height: 68,
                  flex: "none",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    inset: "-4px",
                    borderRadius: 999,
                    background: `conic-gradient(#FF8A3C 0deg,#E4560F ${data.match * 3.6}deg,rgba(255,255,255,.12) ${data.match * 3.6}deg)`,
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    inset: "-1px",
                    borderRadius: 999,
                    bgcolor: "background.paper",
                  }}
                />
                <Avatar
                  sx={{
                    position: "absolute",
                    top: 2,
                    left: 2,
                    width: 64,
                    height: 64,
                    bgcolor: data.avatarBg,
                    color: data.avatarFg,
                    fontSize: 20,
                    fontWeight: 700,
                  }}
                >
                  {data.initials}
                </Avatar>
                <Box
                  sx={{
                    position: "absolute",
                    bottom: -7,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: ORANGE_GRADIENT,
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                    p: "2px 8px",
                    borderRadius: 999,
                    whiteSpace: "nowrap",
                  }}
                >
                  {data.match}%
                </Box>
              </Box>
              <Box>
                <Box
                  sx={{
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: "-.01em",
                  }}
                >
                  {data.name}
                </Box>
                <Box sx={{ fontSize: 13.5, color: "#C9C5BD", mt: "4px" }}>
                  {data.headline}
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px 14px",
                    mt: "8px",
                    fontSize: 12,
                    color: "text.secondary",
                    flexWrap: "wrap",
                  }}
                >
                  {data.heroMeta.map((row) => (
                    <Box
                      key={row.icon}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <IconRenderer name={row.icon} size={14} />
                      {row.text}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: "8px", flex: "none" }}>
              {/* ponytail: Message / Schedule have no target screens yet — inert buttons. */}
              <Button
                variant="outlined"
                startIcon={<IconRenderer name="mail" size={16} />}
              >
                {t("actions.message")}
              </Button>
              <Button
                variant="contained"
                startIcon={<IconRenderer name="event" size={16} />}
              >
                {t("actions.schedule")}
              </Button>
              <IconButton sx={{ width: 36, height: 36 }}>
                <IconRenderer name="more" size={16} />
              </IconButton>
            </Box>
          </Box>
          <TimelineStrip stages={data.timeline} />
        </Card>

        <Card sx={{ p: "22px 24px" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              mb: "18px",
            }}
          >
            <IconRenderer name="psychology" size={20} color="#FF9D57" />
            <Box sx={{ fontSize: 15, fontWeight: 700 }}>
              {t("report.title")}
            </Box>
            <Box sx={{ fontSize: 12, color: "text.disabled" }}>
              · {data.report.subtitle}
            </Box>
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "190px 1fr" },
              gap: "24px",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <MatchRing size={128} score={data.report.score}>
                <Box
                  sx={{
                    position: "absolute",
                    inset: "10px",
                    borderRadius: 999,
                    bgcolor: "background.paper",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Box
                    sx={{
                      fontSize: 29,
                      fontWeight: 700,
                      letterSpacing: "-.02em",
                      color: "#FF9D57",
                    }}
                  >
                    {data.report.score}%
                  </Box>
                  <Box
                    sx={{
                      fontSize: 11,
                      color: "text.disabled",
                      letterSpacing: ".08em",
                    }}
                  >
                    {t("report.aiMatch")}
                  </Box>
                </Box>
              </MatchRing>
              <Chip
                variant="soft"
                color={data.report.verdictTone}
                label={data.report.verdict}
                sx={{ fontSize: 11.5, fontWeight: 700 }}
              />
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: "12px 22px",
                }}
              >
                {data.report.bars.map((bar) => (
                  <Box key={bar.label}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                        color: "#C9C5BD",
                        mb: "5px",
                      }}
                    >
                      <span>{bar.label}</span>
                      <Box
                        component="span"
                        sx={{ fontWeight: 700, color: "text.primary" }}
                      >
                        {bar.score}%
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        height: 6,
                        borderRadius: 999,
                        background: "#2A2A28",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          height: "100%",
                          width: `${bar.score}%`,
                          background: "linear-gradient(90deg,#FF8A3C,#E4560F)",
                          borderRadius: 999,
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: "12px",
                  borderTop: "1px solid",
                  borderColor: "divider",
                  pt: "14px",
                }}
              >
                <Box>
                  <Box
                    sx={{
                      fontSize: 11,
                      letterSpacing: ".08em",
                      color: "text.disabled",
                      mb: "8px",
                    }}
                  >
                    {t("report.strengths")}
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "7px",
                    }}
                  >
                    {data.report.strengths.map((line) => (
                      <Box
                        key={line}
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "8px",
                          fontSize: 12.5,
                          lineHeight: 1.5,
                          color: "#C9C5BD",
                        }}
                      >
                        <IconRenderer
                          name="check-circle"
                          size={15}
                          color="#8FD6AC"
                        />
                        {line}
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box>
                  <Box
                    sx={{
                      fontSize: 11,
                      letterSpacing: ".08em",
                      color: "text.disabled",
                      mb: "8px",
                    }}
                  >
                    {t("report.watchouts")}
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "7px",
                    }}
                  >
                    {data.report.gaps.map((line) => (
                      <Box
                        key={line}
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "8px",
                          fontSize: 12.5,
                          lineHeight: 1.5,
                          color: "#C9C5BD",
                        }}
                      >
                        <IconRenderer name="flag" size={15} color="#F0C27C" />
                        {line}
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Card>

        <Card sx={{ p: "20px 22px" }}>
          <SectionTitle text={t("experience.title")} />
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {data.experience.map((entry, i) => (
              <Box
                key={`${entry.title}-${entry.company}`}
                sx={{ display: "flex", gap: "14px" }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: 12,
                    flex: "none",
                  }}
                >
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      background: i === 0 ? "#F26A1B" : "#2A2A28",
                      border: `2px solid ${
                        i === 0 ? "rgba(242,106,27,.4)" : "rgba(255,255,255,.2)"
                      }`,
                      mt: "4px",
                    }}
                  />
                  {i < data.experience.length - 1 ? (
                    <Box
                      sx={{
                        width: "2px",
                        flex: 1,
                        background: "rgba(255,255,255,.08)",
                        m: "4px 0",
                      }}
                    />
                  ) : null}
                </Box>
                <Box sx={{ pb: "18px", flex: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      gap: "10px",
                    }}
                  >
                    <Box sx={{ fontSize: 14, fontWeight: 700 }}>
                      {entry.title}{" "}
                      <Box
                        component="span"
                        sx={{ color: "text.secondary", fontWeight: 400 }}
                      >
                        · {entry.company}
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        fontSize: 12,
                        color: "text.disabled",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {entry.period}
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      fontSize: 12.5,
                      lineHeight: 1.6,
                      color: "text.secondary",
                      mt: "5px",
                    }}
                  >
                    {entry.blurb}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Card>

        <Card sx={{ p: "20px 22px" }}>
          <SectionTitle text={t("education.title")} />
          <Box sx={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {data.education.map((entry) => (
              <Box
                key={entry.title}
                sx={{ display: "flex", alignItems: "center", gap: "13px" }}
              >
                <Avatar
                  variant="rounded"
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: "11px",
                    bgcolor: "rgba(242,106,27,.12)",
                    border: "1px solid rgba(242,106,27,.25)",
                  }}
                >
                  <IconRenderer name={entry.icon} size={18} color="#FF9D57" />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ fontSize: 13.5, fontWeight: 700 }}>
                    {entry.title}
                  </Box>
                  <Box
                    sx={{ fontSize: 12, color: "text.secondary", mt: "2px" }}
                  >
                    {entry.sub}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Card>

        <Card sx={{ p: "20px 22px" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: "14px",
            }}
          >
            <Box sx={{ fontSize: 15, fontWeight: 700 }}>
              {t("skills.title")}
            </Box>
            <Box sx={{ fontSize: 12, color: "text.disabled" }}>
              {t("skills.hint")}
            </Box>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {data.skills.map((skill) => {
              const required = data.requiredSkills.includes(skill);
              return (
                <Chip
                  key={skill}
                  variant="soft"
                  color={required ? "primary" : "default"}
                  label={
                    required ? (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        {skill}
                        <IconRenderer name="check" size={13} color="#FF9D57" />
                      </Box>
                    ) : (
                      skill
                    )
                  }
                  sx={{ fontSize: 12.5, fontWeight: 600 }}
                />
              );
            })}
          </Box>
        </Card>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Card>
          <SectionTitle text={t("details.title")} mb="14px" />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              fontSize: 13,
            }}
          >
            {data.details.map((row) => (
              <Box
                key={row.icon}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "#C9C5BD",
                }}
              >
                <IconRenderer name={row.icon} size={16} color="#7C7972" />
                {row.text}
              </Box>
            ))}
          </Box>
        </Card>

        <Card>
          <SectionTitle text={t("attachments.title")} mb="12px" />
          <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {data.attachments.map((attachment) => (
              <Card
                key={attachment.title}
                variant="inset"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "11px",
                  cursor: "pointer",
                  "&:hover": { borderColor: "rgba(242,106,27,.4)" },
                }}
              >
                <IconRenderer
                  name={attachment.icon}
                  size={18}
                  color={attachment.color}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box
                    sx={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {attachment.title}
                  </Box>
                  <Box sx={{ fontSize: 11, color: "text.disabled" }}>
                    {attachment.sub}
                  </Box>
                </Box>
                <IconRenderer
                  name={attachment.action}
                  size={16}
                  color="#7C7972"
                />
              </Card>
            ))}
          </Box>
        </Card>

        <Card>
          <SectionTitle text={t("applying.title")} mb="12px" />
          <LinkRenderer config={config.appliedJobLink}>
            <Card
              variant="inset"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                "&:hover": { borderColor: "rgba(242,106,27,.4)" },
              }}
            >
              <Avatar
                variant="rounded"
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: data.appliedJob.bg,
                  color: data.appliedJob.fg,
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {data.appliedJob.initial}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ fontSize: 13, fontWeight: 600 }}>
                  {data.appliedJob.title}
                </Box>
                <Box sx={{ fontSize: 11.5, color: "text.secondary" }}>
                  {data.appliedJob.meta}
                </Box>
              </Box>
              <IconRenderer name="chevron-right" size={16} color="#7C7972" />
            </Card>
          </LinkRenderer>
        </Card>

        <Card>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: "12px",
            }}
          >
            <Box sx={{ fontSize: 14, fontWeight: 700 }}>
              {t("interviews.title")}
            </Box>
            {/* ponytail: no Interviews screen yet — inert schedule affordance. */}
            <Button
              variant="text"
              sx={{ p: 0, minWidth: 0, fontSize: 12, color: "#F0B27C" }}
            >
              {t("interviews.schedule")}
            </Button>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {data.interviews.map((interview) => {
              const upcoming = interview.state === "upcoming";
              return (
                <Card
                  key={interview.title}
                  variant="inset"
                  sx={{
                    borderRadius: "12px",
                    p: "12px 14px",
                    ...(upcoming && {
                      background:
                        "linear-gradient(135deg,rgba(242,106,27,.25),rgba(20,20,19,.6)),#141413",
                      borderColor: "rgba(242,106,27,.35)",
                    }),
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: "4px",
                      gap: "8px",
                    }}
                  >
                    <Box
                      sx={{
                        fontSize: 13,
                        fontWeight: upcoming ? 700 : 600,
                        color: upcoming ? "text.primary" : "#C9C5BD",
                      }}
                    >
                      {interview.title}
                    </Box>
                    {upcoming ? (
                      <Button
                        variant="contained"
                        color="secondary"
                        sx={{ fontSize: 11.5, p: "5px 12px" }}
                      >
                        {t("interviews.join")}
                      </Button>
                    ) : interview.badge ? (
                      <Chip
                        variant="soft"
                        color="success"
                        size="small"
                        label={interview.badge}
                        sx={{ fontSize: 11.5 }}
                      />
                    ) : null}
                  </Box>
                  <Box
                    sx={{
                      fontSize: 12,
                      color: upcoming ? "#E8C4A6" : "text.disabled",
                    }}
                  >
                    {interview.when}
                  </Box>
                </Card>
              );
            })}
          </Box>
        </Card>

        <Card>
          <SectionTitle text={t("notes.title")} mb="12px" />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              mb: "12px",
            }}
          >
            <OutlinedInput
              value={noteText}
              placeholder={t("notes.placeholder")}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addNote();
              }}
              sx={{
                flex: 1,
                minWidth: 0,
                fontSize: 12.5,
                borderRadius: "10px",
                "& input": { py: "9px" },
              }}
            />
            <IconButton
              onClick={addNote}
              sx={{
                width: 33,
                height: 33,
                border: "none",
                background: ORANGE_GRADIENT,
                color: "#fff",
                "&:hover": {
                  background: ORANGE_GRADIENT,
                  filter: "brightness(1.08)",
                },
              }}
            >
              <IconRenderer name="add" size={15} color="#fff" />
            </IconButton>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {localNotes.map((note) => (
              <Box key={note.key} sx={{ display: "flex", gap: "10px" }}>
                <Avatar
                  sx={{
                    width: 26,
                    height: 26,
                    fontSize: 9.5,
                    bgcolor: data.noteAuthor.avatarBg,
                    color: data.noteAuthor.avatarFg,
                  }}
                >
                  {data.noteAuthor.initials}
                </Avatar>
                <Box>
                  <Box
                    sx={{ fontSize: 12.5, lineHeight: 1.55, color: "#C9C5BD" }}
                  >
                    {note.text}
                  </Box>
                  <Box sx={{ fontSize: 11, color: "text.disabled", mt: "4px" }}>
                    {data.noteAuthor.name} · {t("notes.justNow")}
                  </Box>
                </Box>
              </Box>
            ))}
            {data.teamNotes.map((note) => (
              <Box key={note.text} sx={{ display: "flex", gap: "10px" }}>
                <Avatar
                  sx={{
                    width: 26,
                    height: 26,
                    fontSize: 9.5,
                    bgcolor: note.avatarBg,
                    color: note.avatarFg,
                  }}
                >
                  {note.initials}
                </Avatar>
                <Box>
                  <Box
                    sx={{ fontSize: 12.5, lineHeight: 1.55, color: "#C9C5BD" }}
                  >
                    {note.text}
                  </Box>
                  <Box sx={{ fontSize: 11, color: "text.disabled", mt: "4px" }}>
                    {note.author} · {note.when}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
