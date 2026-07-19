"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import {
  useConfiguration,
  useFetch,
  useRouteParams,
  useTranslation,
} from "@recruit/sdk";
import { IconRenderer, LinkRenderer, Toast, useToast } from "@recruit/shared";
import type { ClientPortalConfig } from "./client-portal.configuration";

interface Submission {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  score: number;
  role: string;
  submittedWhen: string;
  exp: string;
  comp: string;
  why: string;
  decision: "pending" | "approved" | "rejected";
  reason: string;
}

interface Portal {
  client: string;
  clientId: string;
  clientInitial: string;
  contactName: string;
  contactRole: string;
  contactInitials: string;
  contactBg: string;
  contactFg: string;
  expiresDays: number;
  pending: Submission[];
  decided: Submission[];
}

const GREEN = "#8FD6AC";
const RED = "#E89A9A";

function Brand({ label, tag }: { label: string; tag: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <Avatar
        variant="rounded"
        sx={{
          width: 32,
          height: 32,
          background: "linear-gradient(135deg,#FF8A3C,#E4560F)",
          fontWeight: 700,
          fontSize: 15,
          color: "#fff",
        }}
      >
        T
      </Avatar>
      <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#ECEAE7" }}>
        {label}
        <Box component="span" sx={{ color: "text.disabled", fontWeight: 500 }}>
          {" · "}
          {tag}
        </Box>
      </Typography>
    </Box>
  );
}

export function ClientPortalComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<ClientPortalConfig>(id);
  const { token } = useRouteParams();
  const { toast, show, clear } = useToast();
  const { data, mutation, mutate } = useFetch<Portal>(id, {
    filters: { token },
  });

  if (!config || !data) return null;
  const portal = data;
  const firstName = (portal.contactName || "there").split(" ")[0];

  const decide = async (
    submission: Submission,
    decision: "approved" | "declined",
  ) => {
    await mutation.decide?.(token, {
      submissionId: submission.id,
      decision,
    });
    await mutate();
    show(
      decision === "approved" ? t("toast.approved") : t("toast.declined"),
      decision === "approved"
        ? t("toast.approvedSub", { name: submission.name })
        : t("toast.declinedSub", { name: submission.name }),
    );
  };

  const viewCv = (submission: Submission) =>
    show(t("toast.viewCv"), t("toast.viewCvSub", { name: submission.name }));

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#131211" }}>
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
          p: "14px 28px",
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "rgba(19,18,17,.9)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <Brand label={t("brand")} tag={t("brandTag")} />
          <Box
            sx={{ width: "1px", height: 26, bgcolor: "divider", flex: "none" }}
          />
          <Typography
            sx={{ fontSize: 12, color: "text.secondary", whiteSpace: "nowrap" }}
          >
            {t("topbar.shared", {
              client: portal.client,
              days: portal.expiresDays,
            })}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "9px" }}>
            <Avatar
              sx={{
                width: 30,
                height: 30,
                bgcolor: portal.contactBg,
                color: portal.contactFg,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {portal.contactInitials}
            </Avatar>
            <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>
              {portal.contactName}
              <Box component="span" sx={{ color: "text.disabled" }}>
                {" · "}
                {portal.contactRole}
              </Box>
            </Typography>
          </Box>
          <LinkRenderer
            config={{
              ...config.loginLink,
              id,
              sx: { fontSize: 12, color: "text.secondary" },
            }}
          />
          <LinkRenderer
            config={{
              ...config.agencyViewLink,
              id,
              sx: { fontSize: 12, color: "primary.light", fontWeight: 600 },
            }}
            data={{ clientId: portal.clientId }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          maxWidth: 860,
          mx: "auto",
          p: { xs: "28px 20px", md: "44px 28px" },
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: 24, md: 30 },
            fontWeight: 700,
            letterSpacing: "-.015em",
            lineHeight: 1.2,
          }}
        >
          {portal.pending.length === 0
            ? t("hero.caughtUp", { name: firstName })
            : t("hero.waiting", {
                count: portal.pending.length,
                name: firstName,
              })}
        </Typography>
        <Typography
          sx={{
            fontSize: 14,
            color: "text.secondary",
            mt: "12px",
            lineHeight: 1.65,
            maxWidth: 640,
          }}
        >
          {t("hero.sub")}
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            mt: "32px",
          }}
        >
          {portal.pending.map((submission) => (
            <Card key={submission.id} variant="base" sx={{ p: "22px 24px" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                }}
              >
                <Avatar
                  sx={{
                    width: 46,
                    height: 46,
                    flex: "none",
                    bgcolor: submission.avatarBg,
                    color: submission.avatarFg,
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                >
                  {submission.initials}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography sx={{ fontSize: 16.5, fontWeight: 700 }}>
                      {submission.name}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: "#FF9D57",
                        background: "rgba(242,106,27,.12)",
                        border: "1px solid rgba(242,106,27,.25)",
                        px: "9px",
                        py: "3px",
                        borderRadius: "999px",
                      }}
                    >
                      <IconRenderer name="sparkle" size={11} color="#FF9D57" />
                      {t("card.match", { score: submission.score })}
                    </Box>
                    <Typography sx={{ fontSize: 12, color: "text.disabled" }}>
                      {t("card.submitted", { when: submission.submittedWhen })}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{ fontSize: 13, color: "text.secondary", mt: "4px" }}
                  >
                    {t("card.meta", {
                      role: submission.role,
                      exp: submission.exp,
                      comp: submission.comp,
                    })}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  mt: "16px",
                  p: "14px 16px",
                  borderRadius: "13px",
                  border: "1px solid rgba(242,106,27,.18)",
                  background: "rgba(242,106,27,.05)",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    color: "#FF9D57",
                    mb: "6px",
                  }}
                >
                  {t("card.why")}
                </Typography>
                <Typography
                  sx={{ fontSize: 13, lineHeight: 1.65, color: "#CFC9BF" }}
                >
                  {submission.why}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  mt: "18px",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  onClick={() => viewCv(submission)}
                  startIcon={
                    <IconRenderer name="pdf" size={15} color="#E0765A" />
                  }
                  sx={{ fontWeight: 600, color: "text.secondary" }}
                >
                  {t("card.viewCv")}
                </Button>
                <Box sx={{ flex: 1 }} />
                <Button
                  onClick={() => decide(submission, "declined")}
                  startIcon={<IconRenderer name="close" size={15} />}
                  sx={{
                    color: RED,
                    background: "rgba(200,80,80,.12)",
                    border: "1px solid rgba(200,80,80,.4)",
                    fontWeight: 600,
                    "&:hover": { background: "rgba(200,80,80,.22)" },
                  }}
                >
                  {t("card.decline")}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => decide(submission, "approved")}
                  startIcon={
                    <IconRenderer name="check" size={15} color="#fff" />
                  }
                  sx={{
                    background: "linear-gradient(135deg,#5FBF87,#2F8F5B)",
                    "&:hover": {
                      background: "linear-gradient(135deg,#6FCF97,#3F9F6B)",
                    },
                  }}
                >
                  {t("card.approve")}
                </Button>
              </Box>
            </Card>
          ))}
        </Box>

        {portal.decided.length > 0 ? (
          <Box sx={{ mt: "40px" }}>
            <Typography
              sx={{
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: "text.disabled",
                mb: "14px",
              }}
            >
              {t("decided.title")}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {portal.decided.map((submission) => {
                const approved = submission.decision === "approved";
                return (
                  <Box
                    key={submission.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      p: "12px 16px",
                      borderRadius: "12px",
                      border: "1px solid",
                      borderColor: "divider",
                      background: "rgba(255,255,255,.02)",
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 34,
                        height: 34,
                        bgcolor: submission.avatarBg,
                        color: submission.avatarFg,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {submission.initials}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>
                        {submission.name}
                      </Typography>
                      <Typography
                        sx={{ fontSize: 11.5, color: "text.disabled" }}
                      >
                        {submission.role}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: approved ? GREEN : RED,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <IconRenderer
                        name={approved ? "check-circle" : "close"}
                        size={15}
                        color={approved ? GREEN : RED}
                      />
                      {approved
                        ? t("decided.approved")
                        : t("decided.declined", {
                            reason: submission.reason
                              ? ` · ${submission.reason}`
                              : "",
                          })}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        ) : null}

        <Typography
          sx={{
            fontSize: 11.5,
            color: "text.disabled",
            textAlign: "center",
            mt: "48px",
          }}
        >
          {t("footer")}
        </Typography>
      </Box>

      <Toast toast={toast} onClose={clear} />
    </Box>
  );
}
