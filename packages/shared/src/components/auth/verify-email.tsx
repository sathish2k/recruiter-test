"use client";

import MarkEmailUnreadRounded from "@mui/icons-material/MarkEmailUnreadRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useConfiguration, useTranslation } from "@recruit/sdk";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IconRenderer } from "../renderers";
import { LinkRenderer, type LinkRendererConfig } from "../renderers/link-renderer";
import { AuthCard } from "./auth-card";

export interface VerifyEmailHandlers {
  /** Confirms the typed code. Resolves true when the account is now verified. */
  confirm: (code: string) => Promise<boolean>;
  /** Requests a fresh code. Rejects with `retryAfter` while on cooldown. */
  resend: () => Promise<void>;
  /** Confirms a magic-link token, when the URL carried one. */
  confirmLink?: (token: string) => Promise<boolean>;
}

interface VerifyConfig {
  links?: Record<string, LinkRendererConfig>;
}

/** 30 minutes, as the code's own lifetime. */
const TTL_SECONDS = 30 * 60;

/**
 * §5.1.2 — mandatory email verification. Six-digit code plus the magic-link
 * alternative, a live expiry countdown, and a rate-limited resend.
 *
 * There is deliberately **no skip control**: TC-AUTH-004 asserts one does not
 * exist anywhere on this screen.
 */
export function VerifyEmail({ id, handlers }: { id: string; handlers: VerifyEmailHandlers }) {
  const { t } = useTranslation(id);
  const { links } = useConfiguration<VerifyConfig>(id);
  const query = useSearchParams();
  // Sign-up hands the address over in the URL; the magic link carries a token
  // instead, and then the address is only needed for the copy.
  const email = query.get("email") ?? "";
  const token = query.get("token") ?? undefined;
  const [code, setCode] = useState("");
  const [state, setState] = useState<"idle" | "working" | "expired" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(TTL_SECONDS);
  const [cooldown, setCooldown] = useState(0);
  const linkTried = useRef(false);

  // A link arrival verifies without the user typing anything.
  useEffect(() => {
    if (!token || linkTried.current || !handlers.confirmLink) return;
    linkTried.current = true;
    setState("working");
    handlers
      .confirmLink(token)
      .then((ok) => setState(ok ? "done" : "expired"))
      .catch(() => setState("expired"));
  }, [token, handlers]);

  // One ticker drives both the code's expiry and the resend cooldown.
  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((value) => (value > 0 ? value - 1 : 0));
      setCooldown((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const clock = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;

  const submit = async () => {
    if (code.length !== 6 || state === "working") return;
    setState("working");
    setError(null);
    try {
      const ok = await handlers.confirm(code);
      setState(ok ? "done" : "idle");
      if (!ok) setError(t("errors.invalid"));
    } catch (cause) {
      const detail = cause as { code?: string; retryAfter?: number };
      if (detail.code === "expired") {
        setState("expired");
        return;
      }
      setState("idle");
      setError(t(`errors.${detail.code ?? "invalid"}`, t("errors.invalid")));
    }
  };

  const resend = async () => {
    if (cooldown > 0) return;
    setError(null);
    try {
      await handlers.resend();
      setRemaining(TTL_SECONDS);
      setCooldown(60);
      setState("idle");
      setCode("");
    } catch (cause) {
      const detail = cause as { code?: string; retryAfter?: number };
      setCooldown(detail.retryAfter ?? 60);
      setError(t(`errors.${detail.code ?? "invalid"}`, t("errors.invalid")));
    }
  };

  if (state === "done") {
    return (
      <AuthCard
        icon={<IconRenderer name="check-circle" size={26} />}
        title={t("done.title")}
        subtitle={t("done.subtitle")}
      >
        {links?.getStarted ? (
          <LinkRenderer config={links.getStarted}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<IconRenderer name="rocket" size={16} />}
            >
              {t("done.cta")}
            </Button>
          </LinkRenderer>
        ) : null}
      </AuthCard>
    );
  }

  if (state === "expired") {
    return (
      <AuthCard
        icon={<IconRenderer name="warning" size={26} />}
        title={t("expired.title")}
        subtitle={t("expired.subtitle", { email })}
      >
        <Button variant="contained" fullWidth onClick={resend} disabled={cooldown > 0}>
          {cooldown > 0 ? t("resendIn", { seconds: cooldown }) : t("expired.cta")}
        </Button>
        <Notice text={t("expired.note")} icon="shield" />
      </AuthCard>
    );
  }

  return (
    <AuthCard
      icon={<MarkEmailUnreadRounded sx={{ fontSize: 26 }} />}
      title={t("title")}
      subtitle={t("subtitle", { email })}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <Typography sx={{ fontSize: 12, color: "text.disabled", textAlign: "center" }}>
          {t("expiresIn", { clock })}
        </Typography>

        <TextField
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
          onKeyDown={(event) => {
            if (event.key === "Enter") void submit();
          }}
          placeholder="——————"
          autoFocus
          slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 6 } }}
          error={Boolean(error)}
          helperText={error ?? undefined}
          sx={{
            "& input": {
              textAlign: "center",
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: "0.4em",
            },
          }}
        />

        <Button
          variant="contained"
          fullWidth
          loading={state === "working"}
          disabled={code.length !== 6}
          onClick={submit}
        >
          {t("cta")}
        </Button>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            fontSize: 13,
            color: "text.secondary",
          }}
        >
          {cooldown > 0 ? (
            <Typography component="span" sx={{ fontSize: 13, color: "text.disabled" }}>
              {t("resendIn", { seconds: cooldown })}
            </Typography>
          ) : (
            <Link
              component="button"
              type="button"
              underline="none"
              onClick={resend}
              sx={{
                fontSize: 13,
                fontWeight: 600,
                color: "surface.primarySoftFg",
                "&:hover": { color: "primary.light" },
              }}
            >
              {t("resend")}
            </Link>
          )}
          <span>·</span>
          {links?.signIn ? (
            <LinkRenderer config={{ ...links.signIn, text: t("changeEmail") }} />
          ) : null}
        </Box>
      </Box>

      <Notice text={t("why")} icon="mail" />
    </AuthCard>
  );
}

/** The design's explanatory strip under the card. */
function Notice({ text, icon }: { text: string; icon: string }) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: "10px",
        mt: "20px",
        p: "12px 14px",
        borderRadius: "12px",
        bgcolor: "surface.inset",
        border: "1px solid",
        borderColor: "surface.border",
      }}
    >
      <Box sx={{ display: "flex", flex: "none", color: "surface.textDisabled", mt: "1px" }}>
        <IconRenderer name={icon} size={16} />
      </Box>
      <Typography sx={{ fontSize: 11.5, lineHeight: 1.6, color: "text.disabled" }}>
        {text}
      </Typography>
    </Box>
  );
}
