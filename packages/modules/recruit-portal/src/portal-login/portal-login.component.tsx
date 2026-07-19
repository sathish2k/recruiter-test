"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import OutlinedInput from "@mui/material/OutlinedInput";
import Typography from "@mui/material/Typography";
import {
  useConfiguration,
  useFetch,
  usePortalRouter,
  useTranslation,
} from "@recruit/sdk";
import { IconRenderer, LinkRenderer, Toast, useToast } from "@recruit/shared";
import { type FormEvent, useState } from "react";
import type { PortalLoginConfig } from "./portal-login.configuration";

interface MagicLinkResult {
  ok: true;
  token?: string;
  contactName?: string;
}

const PANEL_BG = "#1A1917";

function Brand({ label, tag }: { label: string; tag: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <Avatar
        variant="rounded"
        sx={{
          width: 34,
          height: 34,
          background: "linear-gradient(135deg,#FF8A3C,#E4560F)",
          fontWeight: 700,
          fontSize: 16,
          color: "#fff",
        }}
      >
        T
      </Avatar>
      <Typography sx={{ fontWeight: 700, fontSize: 15.5, color: "#ECEAE7" }}>
        {label}
        <Box component="span" sx={{ color: "text.disabled", fontWeight: 500 }}>
          {" · "}
          {tag}
        </Box>
      </Typography>
    </Box>
  );
}

export function PortalLoginComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<PortalLoginConfig>(id);
  const router = usePortalRouter();
  const { mutation } = useFetch<unknown>(id);
  const { toast, show, clear } = useToast();

  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!config) return null;

  const send = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!email.trim() || busy) return;
    setBusy(true);
    try {
      const res = (await mutation.magicLink?.(email.trim())) as
        | { data: MagicLinkResult }
        | undefined;
      setSentTo(email.trim());
      setToken(res?.data?.token ?? null);
      show(t("toast.sent"), t("toast.sentSub", { email: email.trim() }));
    } catch {
      show(t("toast.error"), t("toast.errorSub"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: "24px",
        background:
          "radial-gradient(80% 60% at 50% 115%,rgba(242,106,27,.32),transparent),#141312",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(rgba(255,255,255,.05) 1px,transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage:
            "radial-gradient(70% 60% at 50% 45%,black,transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(70% 60% at 50% 45%,black,transparent 85%)",
          pointerEvents: "none",
        }}
      />

      <Box sx={{ position: "absolute", top: 32, left: 40 }}>
        <Brand label={t("brand")} tag={t("brandTag")} />
      </Box>

      <Box
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: 420,
          borderRadius: "20px",
          border: "1px solid",
          borderColor: "divider",
          background: `linear-gradient(180deg,rgba(242,106,27,.10),transparent 40%),${PANEL_BG}`,
          boxShadow: "0 30px 70px rgba(0,0,0,.5)",
          p: "36px 34px",
        }}
      >
        {sentTo === null ? (
          <Box component="form" onSubmit={send}>
            <Avatar
              variant="rounded"
              sx={{
                width: 46,
                height: 46,
                borderRadius: "14px",
                bgcolor: "rgba(242,106,27,.14)",
                color: "#FF9D57",
                border: "1px solid rgba(242,106,27,.3)",
                mb: "20px",
              }}
            >
              <IconRenderer name="lock-open" size={22} color="#FF9D57" />
            </Avatar>
            <Typography
              sx={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.01em" }}
            >
              {t("enter.title")}
            </Typography>
            <Typography
              sx={{
                fontSize: 13.5,
                color: "text.secondary",
                mt: "8px",
                lineHeight: 1.6,
              }}
            >
              {t("enter.subtitle")}
            </Typography>

            <OutlinedInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("enter.emailPlaceholder")}
              fullWidth
              autoFocus
              startAdornment={
                <Box sx={{ mr: "10px", display: "flex" }}>
                  <IconRenderer name="mail" size={17} color="#8A867E" />
                </Box>
              }
              sx={{ mt: "22px" }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={busy || !email.trim()}
              startIcon={
                <IconRenderer name="magic-button" size={17} color="#fff" />
              }
              sx={{ mt: "16px", py: "11px" }}
            >
              {t("enter.submit")}
            </Button>

            <Box
              sx={{
                mt: "26px",
                pt: "18px",
                borderTop: "1px solid",
                borderColor: "divider",
                fontSize: 12,
                color: "text.disabled",
                lineHeight: 1.6,
              }}
            >
              {t("footer.invited")}{" "}
              <LinkRenderer
                config={{
                  ...config.teamLoginLink,
                  id,
                  sx: { color: "primary.light", fontWeight: 600 },
                }}
              />
            </Box>
          </Box>
        ) : (
          <Box>
            <Avatar
              variant="rounded"
              sx={{
                width: 46,
                height: 46,
                borderRadius: "14px",
                bgcolor: "rgba(78,168,116,.14)",
                color: "#8FD6AC",
                border: "1px solid rgba(78,168,116,.32)",
                mb: "20px",
              }}
            >
              <IconRenderer name="mark-email-read" size={22} color="#8FD6AC" />
            </Avatar>
            <Typography
              sx={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.01em" }}
            >
              {t("sent.title")}
            </Typography>
            <Typography
              sx={{
                fontSize: 13.5,
                color: "text.secondary",
                mt: "8px",
                lineHeight: 1.6,
              }}
            >
              {t("sent.subtitle", { email: sentTo })}
            </Typography>

            <Button
              variant="contained"
              fullWidth
              disabled={!token}
              onClick={() =>
                token && router.push(config.portalRouteId, { token })
              }
              endIcon={
                <IconRenderer name="arrow-forward" size={16} color="#fff" />
              }
              sx={{ mt: "24px", py: "11px" }}
            >
              {t("sent.open")}
            </Button>

            <Box
              sx={{
                mt: "20px",
                fontSize: 12.5,
                color: "text.disabled",
                display: "flex",
                gap: "6px",
                justifyContent: "center",
              }}
            >
              {t("sent.resendPrompt")}
              <Box
                component="button"
                type="button"
                onClick={() => send()}
                sx={{
                  background: "none",
                  border: "none",
                  p: 0,
                  cursor: "pointer",
                  color: "primary.light",
                  fontWeight: 600,
                  fontSize: 12.5,
                }}
              >
                {t("sent.resend")}
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      <Toast toast={toast} onClose={clear} />
    </Box>
  );
}
