"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useConfiguration, useTranslation } from "@recruit/sdk";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FormRenderer } from "../forms";
import type { FormValues, JsonSchema } from "../forms/types";
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

  /** The design bolds the address inside the sentence. */
  const withEmail = (key: string) => {
    const text = t(key, { email });
    const [before, after] = text.split(email);
    return (
      <>
        {before}
        <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
          {email}
        </Box>
        {after}
      </>
    );
  };

  const footer = links?.signIn ? (
    <Typography
      sx={{ mt: "22px", fontSize: 12.5, color: "text.secondary", textAlign: "center" }}
      data-testid="verify-wrong-account"
    >
      {t("wrongAccount")}{" "}
      <LinkRenderer
        config={{ ...links.signIn, text: t("signInAsSomeoneElse"), sx: { fontWeight: 600 } }}
      />
    </Typography>
  ) : null;

  if (view === "done") {
    return (
      <AuthCard
        width={500}
        icon={<IconRenderer name="mark-email-read" size={26} />}
        iconColor="surface.successFg"
        title={t("done.title")}
        subtitle={t("done.subtitle")}
        data-testid="verify-done"
      >
        {links?.getStarted ? (
          <LinkRenderer config={links.getStarted}>
            <Button
              variant="contained"
              fullWidth
              data-testid="verify-continue"
              startIcon={<IconRenderer name="rocket" size={17} />}
              sx={{ borderRadius: "12px", py: "14px", fontSize: 14, fontWeight: 700 }}
            >
              {t("done.cta")}
            </Button>
          </LinkRenderer>
        ) : null}
        {footer}
      </AuthCard>
    );
  }

  if (view === "expired") {
    return (
      <AuthCard
        width={500}
        icon={<IconRenderer name="link-off" size={26} />}
        iconColor="surface.errorFg"
        title={t("expired.title")}
        subtitle={withEmail("expired.subtitle")}
        data-testid="verify-expired"
      >
        <Button
          variant="contained"
          fullWidth
          loading={sending}
          disabled={cooldown > 0}
          data-testid="verify-resend-fresh"
          startIcon={<IconRenderer name="send" size={16} />}
          onClick={resend}
          sx={{ borderRadius: "12px", py: "14px", fontSize: 14, fontWeight: 700 }}
        >
          {cooldown > 0 ? t("resendIn", { seconds: cooldown }) : t("expired.cta")}
        </Button>
        <Notice text={t("expired.note")} icon="shield" />
        {footer}
      </AuthCard>
    );
  }

  return (
    <AuthCard
      width={500}
      icon={<IconRenderer name="forward-to-inbox" size={26} />}
      iconColor="surface.accentBright"
      title={t("title")}
      subtitle={withEmail("subtitle")}
      subtitleGap="6px"
      data-testid="verify-pending"
    >
      <Typography
        sx={{ fontSize: 12, color: "text.disabled", textAlign: "center", mb: "22px" }}
        data-testid="verify-expiry"
      >
        {t("expiresIn")}{" "}
        <Box component="b" sx={{ color: "surface.warningSoftFg" }}>
          {clock}
        </Box>
      </Typography>

      {schema ? <FormRenderer id={id} schema={schema} onSubmit={submit} submitLabel="cta" /> : null}

      {error ? (
        <Typography
          sx={{ mt: "10px", fontSize: 12, color: "error.main", textAlign: "center" }}
          data-testid="verify-error"
        >
          {error}
        </Typography>
      ) : null}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "14px",
          mt: "18px",
          fontSize: 12.5,
        }}
      >
        <Link
          component="button"
          type="button"
          underline="none"
          onClick={resend}
          data-testid="verify-resend"
          sx={{
            fontSize: 12.5,
            fontWeight: 600,
            color: resends > 0 ? "surface.successFg" : "surface.primarySoftFg",
            "&:hover": { color: resends > 0 ? "surface.successFg" : "primary.light" },
          }}
        >
          {cooldown > 0
            ? t("resendIn", { seconds: cooldown })
            : resends > 0
              ? t("resent", { count: resends })
              : t("resend")}
        </Link>
        <Box component="span" sx={{ color: "surface.controlOutline" }}>
          |
        </Box>
        {links?.changeEmail ? (
          <LinkRenderer
            config={{
              ...links.changeEmail,
              text: t("changeEmail"),
              sx: { fontSize: 12.5, fontWeight: 600, color: "surface.primarySoftFg" },
            }}
          />
        ) : null}
      </Box>

      <Notice text={t("why")} icon="mark-email-unread" />
      {footer}
    </AuthCard>
  );
}

/** The design's explanatory strip under the card's controls. */
function Notice({ text, icon }: { text: string; icon: string }) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: "10px",
        mt: "20px",
        p: "12px 14px",
        borderRadius: "12px",
        bgcolor: "surface.hoverSubtle",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box sx={{ display: "flex", flex: "none", color: "text.disabled", mt: "1px" }}>
        <IconRenderer name={icon} size={16} />
      </Box>
      <Typography sx={{ fontSize: 11.5, lineHeight: 1.6, color: "text.secondary" }}>
        {text}
      </Typography>
    </Box>
  );
}
