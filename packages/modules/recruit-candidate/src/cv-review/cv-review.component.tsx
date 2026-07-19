"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
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
  Modal,
  Toast,
  useModal,
  useToast,
} from "@recruit/shared";
import { type ReactNode, useState } from "react";
import type { CvReviewConfig } from "./cv-review.configuration";

interface ExperienceEntry {
  title: string;
  company: string;
  period: string;
  blurb: string;
}

interface EducationEntry {
  title: string;
  sub: string;
}

interface QueueItem {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  filename: string;
  role: string;
  client: string;
  sourcer: string;
  title: string;
  contact: string;
  summary: string;
  experience: ExperienceEntry[];
  skills: string[];
  education: EducationEntry[];
  report: {
    score: number;
    scoredWhen: string;
    jd: string;
    musts: { label: string; met: boolean }[];
    dims: { label: string; score: number }[];
    strengths: string[];
    gaps: string[];
  };
}

const GREEN = "#8FD6AC";
const AMBER = "#F0C27C";
const RED = "#E89A9A";
const PAPER_BG = "#F7F5F1";
const PAPER_FG = "#1A1A19";
const PAPER_MUTED = "#5C5850";
const LEFT_SURFACE = "#1A1A19";
const RAIL_BG = "#161615";

function RailTitle({ text }: { text: string }) {
  return (
    <Typography
      sx={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: ".08em",
        textTransform: "uppercase",
        color: "text.disabled",
        mb: "12px",
      }}
    >
      {text}
    </Typography>
  );
}

function ScoreRing({
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
      <Box
        sx={{
          position: "absolute",
          inset: "9px",
          borderRadius: 999,
          bgcolor: RAIL_BG,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export function CvReviewComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<CvReviewConfig>(id);
  const params = useRouteParams();
  const router = usePortalRouter();
  const { data, mutation } = useFetch<QueueItem[]>(id);
  const { toast, show, clear } = useToast();
  const bounceModal = useModal();
  const [note, setNote] = useState("");
  const [reason, setReason] = useState<string | null>(null);

  if (!data || !config || data.length === 0) return null;

  const index = Math.max(
    0,
    data.findIndex((item) => item.id === params.id),
  );
  const current = data[index];
  const prev = index > 0 ? data[index - 1] : undefined;
  const next = index < data.length - 1 ? data[index + 1] : undefined;
  const { report } = current;

  const advance = () => {
    setNote("");
    setReason(null);
    if (next) {
      router.push(config.selfRouteId, { id: next.id });
    } else {
      router.push(config.queueRouteId);
    }
  };

  const submit = async () => {
    await mutation.submit?.(current.id, { decision: "submitted", note });
    show(
      t("toast.submitted"),
      t("toast.submittedSub", { name: current.name, client: current.client }),
    );
    setTimeout(advance, 1000);
  };

  const sendBack = async () => {
    // ponytail: reason is a UI affordance folded into the note.
    const composed = reason ? `[${t(reason)}] ${note}`.trim() : note;
    await mutation.submit?.(current.id, {
      decision: "returned",
      note: composed,
    });
    bounceModal.close();
    show(t("toast.sentBack"), t("toast.sentBackSub", { name: current.name }));
    setTimeout(advance, 1000);
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        bgcolor: "#131313",
      }}
    >
      <Box
        sx={{
          flex: "none",
          position: "sticky",
          top: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          p: "14px 24px",
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "#131313",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            minWidth: 0,
          }}
        >
          <LinkRenderer config={{ ...config.backLink, id }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                fontSize: 12.5,
                fontWeight: 600,
                color: "text.secondary",
                whiteSpace: "nowrap",
                "&:hover": { color: "primary.light" },
              }}
            >
              <IconRenderer name="arrow-back" size={15} />
              {t("back")}
            </Box>
          </LinkRenderer>
          <Box
            sx={{ width: "1px", height: 28, bgcolor: "divider", flex: "none" }}
          />
          <Avatar
            sx={{
              width: 40,
              height: 40,
              flex: "none",
              bgcolor: current.avatarBg,
              color: current.avatarFg,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {current.initials}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Typography
                sx={{ fontSize: 15, fontWeight: 700, whiteSpace: "nowrap" }}
              >
                {current.name}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: 11.5,
                  color: "text.disabled",
                  minWidth: 0,
                }}
              >
                <IconRenderer name="pdf" size={13} color="#E0765A" />
                <Box
                  component="span"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {current.filename}
                </Box>
              </Box>
            </Box>
            <Typography
              sx={{ fontSize: 11.5, color: "text.secondary", mt: "2px" }}
            >
              {t("subline", {
                role: current.role,
                client: current.client,
                sourcer: current.sourcer,
              })}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flex: "none",
          }}
        >
          <Typography
            sx={{ fontSize: 12, color: "text.secondary", whiteSpace: "nowrap" }}
          >
            {t("queueCount", { n: index + 1, total: data.length })}
          </Typography>
          <IconButton
            aria-label={t("prev")}
            disabled={!prev}
            onClick={() =>
              prev && router.push(config.selfRouteId, { id: prev.id })
            }
            sx={{ width: 36, height: 36 }}
          >
            <IconRenderer name="arrow-back" size={16} />
          </IconButton>
          <IconButton
            aria-label={t("next")}
            disabled={!next}
            onClick={() =>
              next && router.push(config.selfRouteId, { id: next.id })
            }
            sx={{ width: 36, height: 36 }}
          >
            <IconRenderer name="arrow-forward" size={16} />
          </IconButton>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(0,1fr) 380px" },
        }}
      >
        <Box
          sx={{
            minWidth: 0,
            bgcolor: LEFT_SURFACE,
            overflowY: "auto",
            p: { xs: "24px", md: "40px" },
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: 760,
              bgcolor: PAPER_BG,
              color: PAPER_FG,
              borderRadius: "16px",
              p: { xs: "28px", md: "40px" },
              boxShadow: "0 24px 60px rgba(0,0,0,.35)",
            }}
          >
            <Typography
              sx={{ fontSize: 28, fontWeight: 700, letterSpacing: "-.01em" }}
            >
              {current.name}
            </Typography>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: PAPER_MUTED,
                mt: "4px",
              }}
            >
              {current.title}
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: PAPER_MUTED, mt: "8px" }}>
              {current.contact}
            </Typography>

            <Box
              sx={{ height: "1px", bgcolor: "rgba(0,0,0,.1)", my: "24px" }}
            />

            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: PAPER_MUTED,
                mb: "10px",
              }}
            >
              {t("summary.title")}
            </Typography>
            <Typography
              sx={{ fontSize: 14, lineHeight: 1.7, color: "#33312D" }}
            >
              {current.summary}
            </Typography>

            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: PAPER_MUTED,
                mt: "28px",
                mb: "14px",
              }}
            >
              {t("experience.title")}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {current.experience.map((entry) => (
                <Box key={`${entry.title}-${entry.company}`}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      gap: "12px",
                    }}
                  >
                    <Typography sx={{ fontSize: 14.5, fontWeight: 700 }}>
                      {entry.title}
                      <Box
                        component="span"
                        sx={{ fontWeight: 400, color: PAPER_MUTED }}
                      >
                        {" · "}
                        {entry.company}
                      </Box>
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: PAPER_MUTED,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {entry.period}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontSize: 13,
                      lineHeight: 1.65,
                      color: "#4A473F",
                      mt: "5px",
                    }}
                  >
                    {entry.blurb}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: PAPER_MUTED,
                mt: "28px",
                mb: "14px",
              }}
            >
              {t("skills.title")}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {current.skills.map((skill) => (
                <Box
                  key={skill}
                  sx={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "#33312D",
                    bgcolor: "rgba(0,0,0,.05)",
                    border: "1px solid rgba(0,0,0,.08)",
                    borderRadius: "999px",
                    p: "5px 12px",
                  }}
                >
                  {skill}
                </Box>
              ))}
            </Box>

            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: PAPER_MUTED,
                mt: "28px",
                mb: "14px",
              }}
            >
              {t("education.title")}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {current.education.map((entry) => (
                <Box key={entry.title}>
                  <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                    {entry.title}
                  </Typography>
                  <Typography
                    sx={{ fontSize: 12.5, color: PAPER_MUTED, mt: "2px" }}
                  >
                    {entry.sub}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            bgcolor: RAIL_BG,
            borderLeft: "1px solid",
            borderColor: "divider",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              p: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <ScoreRing size={84} score={report.score}>
                <Typography
                  sx={{ fontSize: 20, fontWeight: 700, color: "#FF9D57" }}
                >
                  {report.score}%
                </Typography>
              </ScoreRing>
              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "7px" }}>
                  <IconRenderer name="sparkle" size={16} color="#FF9D57" />
                  <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                    {t("report.title")}
                  </Typography>
                </Box>
                <Typography
                  sx={{ fontSize: 11.5, color: "text.secondary", mt: "5px" }}
                >
                  {t("report.subtitle", {
                    jd: report.jd,
                    scoredWhen: report.scoredWhen,
                  })}
                </Typography>
              </Box>
            </Box>

            <Box>
              <RailTitle text={t("musts.title")} />
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: "9px" }}
              >
                {report.musts.map((must) => (
                  <Box
                    key={must.label}
                    sx={{ display: "flex", alignItems: "center", gap: "9px" }}
                  >
                    <IconRenderer
                      name={must.met ? "check-circle" : "error"}
                      size={16}
                      color={must.met ? GREEN : RED}
                    />
                    <Typography sx={{ fontSize: 12.5, color: "#C9C5BD" }}>
                      {must.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box>
              <RailTitle text={t("dims.title")} />
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: "13px" }}
              >
                {report.dims.map((dim) => (
                  <Box key={dim.label}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                        color: "#C9C5BD",
                        mb: "5px",
                      }}
                    >
                      <span>{dim.label}</span>
                      <Box
                        component="span"
                        sx={{ fontWeight: 700, color: "text.primary" }}
                      >
                        {dim.score}%
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
                          width: `${Math.min(100, Math.max(0, dim.score))}%`,
                          background: "linear-gradient(90deg,#FF8A3C,#E4560F)",
                          borderRadius: 999,
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box>
              <RailTitle text={t("strengths.title")} />
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {report.strengths.map((line) => (
                  <Box
                    key={line}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                    }}
                  >
                    <IconRenderer name="check-circle" size={15} color={GREEN} />
                    <Typography
                      sx={{ fontSize: 12.5, lineHeight: 1.5, color: "#C9C5BD" }}
                    >
                      {line}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box>
              <RailTitle text={t("watchout.title")} />
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {report.gaps.map((line) => (
                  <Box
                    key={line}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                    }}
                  >
                    <IconRenderer name="flag" size={15} color={AMBER} />
                    <Typography
                      sx={{ fontSize: 12.5, lineHeight: 1.5, color: "#C9C5BD" }}
                    >
                      {line}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box>
              <RailTitle text={t("note.title")} />
              <TextField
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t("note.placeholder")}
                multiline
                minRows={3}
                fullWidth
                sx={{ "& textarea": { fontSize: 12.5, lineHeight: 1.6 } }}
              />
            </Box>
          </Box>

          <Box
            sx={{
              mt: "auto",
              position: "sticky",
              bottom: 0,
              display: "flex",
              gap: "10px",
              p: "16px 24px",
              borderTop: "1px solid",
              borderColor: "divider",
              bgcolor: RAIL_BG,
            }}
          >
            <Button
              onClick={() => bounceModal.open()}
              startIcon={<IconRenderer name="replay" size={16} color={RED} />}
              sx={{
                flex: 1,
                background: "rgba(200,80,80,.14)",
                border: "1px solid rgba(200,80,80,.45)",
                color: RED,
                fontWeight: 700,
                "&:hover": { background: "rgba(200,80,80,.22)" },
              }}
            >
              {t("actions.sendBack")}
            </Button>
            <Button
              variant="contained"
              onClick={submit}
              startIcon={<IconRenderer name="send" size={16} color="#fff" />}
              sx={{ flex: 1.4 }}
            >
              {t("actions.submit", { client: current.client })}
            </Button>
          </Box>
        </Box>
      </Box>

      <Modal
        open={bounceModal.isOpen}
        onClose={bounceModal.close}
        title={t("bounce.title")}
        description={t("bounce.body")}
        footer={
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <Button
              variant="outlined"
              onClick={bounceModal.close}
              sx={{ fontWeight: 400 }}
            >
              {t("bounce.cancel")}
            </Button>
            <Button
              onClick={sendBack}
              sx={{
                background: "rgba(200,80,80,.2)",
                border: "1px solid rgba(200,80,80,.5)",
                color: RED,
                fontWeight: 700,
              }}
            >
              {t("bounce.confirm")}
            </Button>
          </Box>
        }
      >
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px", mb: "18px" }}>
          {config.bounceReasons.map((key) => (
            <Chip
              key={key}
              variant="soft"
              color={reason === key ? "primary" : "default"}
              label={t(key)}
              onClick={() => setReason((prev) => (prev === key ? null : key))}
              sx={{ fontSize: 12, fontWeight: 600, cursor: "pointer" }}
            />
          ))}
        </Box>
      </Modal>

      <Toast toast={toast} onClose={clear} />
    </Box>
  );
}
