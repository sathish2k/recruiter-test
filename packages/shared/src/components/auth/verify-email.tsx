"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useConfiguration, useTranslation } from "@recruit/sdk";
import { useSearchParams } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { FormRenderer } from "../forms";
import type { FormValues, JsonSchema } from "../forms/types";
import { IconRenderer } from "../renderers";
import { LinkRenderer, type LinkRendererConfig } from "../renderers/link-renderer";
import { AuthCard } from "./auth-card";
import { AuthActionRow, AuthNote, AuthTextAction } from "./auth-parts";

export interface VerifyEmailHandlers {
  /** Confirms the typed code. Resolves true when the account is now verified. */
  confirm: (code: string) => Promise<boolean>;
  /** Requests a fresh code. Rejects with `retryAfter` while on cooldown. */
  resend: () => Promise<void>;
  /** Confirms a magic-link token, when the URL carried one. */
  confirmLink?: (token: string) => Promise<boolean>;
}

interface VerifyConfig {
  schema?: JsonSchema;
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
  const { schema, links } = useConfiguration<VerifyConfig>(id);
  const query = useSearchParams();
  // Sign-up hands the address over in the URL; the magic link carries a token
  // instead, and then the address is only needed for the copy.
  const email = query.get("email") ?? "";
  const token = query.get("token") ?? undefined;

  const [view, setView] = useState<"pending" | "expired" | "done">("pending");
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(TTL_SECONDS);
  const [cooldown, setCooldown] = useState(0);
  const [resends, setResends] = useState(0);
  const [sending, setSending] = useState(false);
  const linkTried = useRef(false);

  // A link arrival verifies without the user typing anything.
  useEffect(() => {
    if (!token || linkTried.current || !handlers.confirmLink) return;
    linkTried.current = true;
    handlers
      .confirmLink(token)
      .then((ok) => setView(ok ? "done" : "expired"))
      .catch(() => setView("expired"));
  }, [token, handlers]);

  // One ticker drives both the code's expiry and the resend cooldown.
  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((value) => (value > 0 ? value - 1 : 0));
      setCooldown((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // The design shows m:ss, not mm:ss — "29:42", then "5:03".
  const clock = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`;

  const submit = async (values: FormValues) => {
    setError(null);
    try {
      const ok = await handlers.confirm(String(values.code ?? ""));
      if (ok) setView("done");
      else setError(t("errors.invalid"));
    } catch (cause) {
      const detail = cause as { code?: string; retryAfter?: number };
      if (detail.code === "expired") {
        setView("expired");
        return;
      }
      setError(t(`errors.${detail.code ?? "invalid"}`, t("errors.invalid")));
    }
  };

  const resend = async () => {
    if (cooldown > 0 || sending) return;
    setError(null);
    setSending(true);
    try {
      await handlers.resend();
      setRemaining(TTL_SECONDS);
      setCooldown(60);
      setResends((count) => count + 1);
      setView("pending");
    } catch (cause) {
      const detail = cause as { code?: string; retryAfter?: number };
      setCooldown(detail.retryAfter ?? 60);
      setError(t(`errors.${detail.code ?? "invalid"}`, t("errors.invalid")));
    } finally {
      setSending(false);
    }
  };

  /** The design bolds the variable parts inside the sentence. */
  const emphasise = (key: string, values: Record<string, string>) => {
    const text = t(key, values);
    const marks = Object.values(values).filter(Boolean);
    if (!marks.length) return text;
    const parts = text.split(new RegExp(`(${marks.map(escapeRegExp).join("|")})`, "g"));
    return parts.map((part, index) =>
      marks.includes(part) ? (
        // Positional split of one sentence — the index is the identity.
        // biome-ignore lint/suspicious/noArrayIndexKey: split fragments
        <Box component="b" key={index} sx={{ fontWeight: 700, color: "text.primary" }}>
          {part}
        </Box>
      ) : (
        part
      ),
    );
  };

  const slab = {
    kicker: t("slab.kicker"),
    title: t("slab.title"),
    blurb: t("slab.blurb"),
    footer: t("slab.footer"),
  };

  const footer: ReactNode = links?.signIn ? (
    <Box component="span" data-testid="verify-wrong-account">
      {t("wrongAccount")}{" "}
      <LinkRenderer
        config={{ ...links.signIn, text: t("signInAsSomeoneElse"), sx: { fontWeight: 600 } }}
      />
    </Box>
  ) : null;

  if (view === "done") {
    return (
      <AuthCard
        icon="mark-email-read"
        tone="success"
        slab={slab}
        footer={footer}
        title={t("done.title")}
        subtitle={t("done.subtitle")}
        subtitleGap="22px"
        data-testid="verify-done"
      >
        {/* The design previews the wizard before handing the user to it, so a
            five-step form isn't a surprise on the other side of sign-in. */}
        <Box
          sx={{
            display: "flex",
            gap: "11px",
            p: "16px",
            borderRadius: "12px",
            bgcolor: "surface.primarySoftBg",
          }}
        >
          <Box sx={{ flex: "none", lineHeight: 1.2, color: "surface.primarySoftFg" }}>
            <IconRenderer name="auto-fix-high" size={20} color="inherit" />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{t("done.wizardTitle")}</Typography>
            <Typography
              sx={{
                fontSize: 12.5,
                lineHeight: 1.6,
                color: "surface.textMuted",
                mt: "3px",
                textWrap: "pretty",
              }}
            >
              {t("done.wizardBody")}
            </Typography>
          </Box>
        </Box>
        <Typography sx={{ fontSize: 12, lineHeight: 1.6, color: "text.secondary", mt: "12px" }}>
          {t("done.note")}
        </Typography>
        {links?.getStarted ? (
          <LinkRenderer config={links.getStarted}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              data-testid="verify-continue"
              endIcon={<IconRenderer name="arrow-forward" size={18} />}
              sx={{ mt: "24px" }}
            >
              {t("done.cta")}
            </Button>
          </LinkRenderer>
        ) : null}
      </AuthCard>
    );
  }

  if (view === "expired") {
    return (
      <AuthCard
        icon="link-off"
        tone="error"
        slab={slab}
        footer={footer}
        title={t("expired.title")}
        subtitle={emphasise("expired.subtitle", { email })}
        subtitleGap="24px"
        data-testid="verify-expired"
      >
        <Button
          variant="contained"
          size="large"
          fullWidth
          loading={sending}
          disabled={cooldown > 0}
          data-testid="verify-resend-fresh"
          onClick={resend}
          sx={{ mb: "20px" }}
        >
          {cooldown > 0 ? t("resendIn", { seconds: cooldown }) : t("expired.cta")}
        </Button>
        <AuthNote icon="shield">{t("expired.note")}</AuthNote>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      slab={slab}
      footer={footer}
      title={t("title")}
      subtitle={emphasise("subtitle", { email, clock })}
      data-testid="verify-pending"
    >
      {schema ? <FormRenderer id={id} schema={schema} onSubmit={submit} submitLabel="cta" /> : null}

      {error ? (
        <Typography
          role="alert"
          data-testid="verify-error"
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: "9px",
            mt: "14px",
            p: "11px 13px",
            borderRadius: "8px",
            bgcolor: "surface.errorSoftBg",
            fontSize: 12.5,
            fontWeight: 600,
            lineHeight: 1.5,
            color: "surface.errorFg",
          }}
        >
          <IconRenderer name="error" size={17} color="inherit" />
          {error}
        </Typography>
      ) : null}

      <AuthActionRow>
        {[
          <AuthTextAction
            key="resend"
            onClick={resend}
            disabled={cooldown > 0 || sending}
            label={
              cooldown > 0
                ? t("resendIn", { seconds: cooldown })
                : resends > 0
                  ? t("resent", { count: resends })
                  : t("resend")
            }
          />,
          links?.changeEmail ? (
            <LinkRenderer key="change" config={{ ...links.changeEmail, text: t("changeEmail") }} />
          ) : null,
        ]}
      </AuthActionRow>

      <Box sx={{ mt: "24px" }}>
        <AuthNote icon="mark-email-unread">{emphasise("why", { sender: t("sender") })}</AuthNote>
      </Box>
    </AuthCard>
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
