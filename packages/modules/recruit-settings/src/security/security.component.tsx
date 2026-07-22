"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import {
  FormModal,
  FormRenderer,
  type FormValues,
  IconRenderer,
  Modal,
  TableRenderer,
  Toast,
  useModal,
  useToast,
} from "@recruit/shared";
import { useMemo, useState } from "react";
import { CardHeader, ListRow, Meter, SectionCard } from "../ui";
import type { SecurityConfig } from "./security.configuration";

interface Session {
  id: string;
  device: string;
  icon: string;
  browser: string;
  meta: string;
  chips: string[];
  isCurrent: boolean;
}
interface Token {
  id: string;
  name: string;
  meta: string;
}
interface Login {
  id: string;
  result: string;
  [key: string]: unknown;
}
interface Recipient {
  id: string;
  email: string;
  owner: boolean;
}
interface SecurityData {
  score: number;
  checks: { key: string; label: string; ok: boolean }[];
  email: string;
  password: { changed: string; strength: string };
  twoFactor: {
    enabled: boolean;
    recoveryCodes: string[];
    generated: string | null;
    verified: string | null;
  };
  sessions: Session[];
  logins: Login[];
  tokens: Token[];
  notifications: Record<string, boolean>;
  recipients: Recipient[];
}

const CHIP_COLORS: Record<string, "success" | "info" | "warning" | "default"> = {
  current: "success",
  trusted: "info",
  mobile: "default",
  new: "warning",
};

/** Checkbox that reads as the design's orange tick, not an MUI checkbox. */
function Check({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <Box
      onClick={onClick}
      sx={{ display: "flex", alignItems: "center", gap: "9px", cursor: "pointer", py: "5px" }}
    >
      <IconRenderer
        name={on ? "check-circle" : "close"}
        size={18}
        sx={{ color: on ? "primary.main" : "text.disabled" }}
      />
      <Typography sx={{ fontSize: 12.5, color: on ? "text.primary" : "text.secondary" }}>
        {label}
      </Typography>
    </Box>
  );
}

export function SettingsSecurityComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<SecurityConfig>(id);
  const { data, mutation, mutate } = useFetch<SecurityData>(id);
  const { toast, show, clear } = useToast();

  const passwordModal = useModal();
  const tokenModal = useModal();
  const [secret, setSecret] = useState<string | null>(null);
  const [codes, setCodes] = useState<string[] | null>(null);
  const [pendingRevoke, setPendingRevoke] = useState<Session | null>(null);
  const [resultFilter, setResultFilter] = useState("all");

  // The login-history table's status cell carries translation keys.
  const historyConfig = useMemo(() => {
    const columns = config.loginHistory.columns.map((column) =>
      column.value.type === "status" && "labels" in column.value
        ? {
            ...column,
            value: {
              ...column.value,
              labels: Object.fromEntries(
                Object.entries(column.value.labels ?? {}).map(([k, v]) => [k, t(v)]),
              ),
            },
          }
        : column,
    );
    return { ...config.loginHistory, columns };
  }, [config.loginHistory, t]);

  // Expiry options are translation keys; resolve them for the select.
  const tokenSchema = useMemo(
    () => ({
      ...config.tokenForm,
      properties: {
        ...config.tokenForm.properties,
        expiresInDays: {
          ...config.tokenForm.properties?.expiresInDays,
          enumNames: ["30", "90", "365", "0"].map((v) => t(`tokenForm.expiryOptions.${v}`)),
        },
      },
    }),
    [config.tokenForm, t],
  );

  if (!data) return null;

  const logins = data.logins.filter((row) => resultFilter === "all" || row.result === resultFilter);

  const changePassword = async (values: FormValues) => {
    try {
      await mutation.update?.({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      await mutate();
      show(t("toast.passwordChanged"), t("toast.passwordChangedSub"));
    } catch {
      show(t("toast.passwordFailed"), t("toast.passwordFailedSub"));
    }
  };

  const toggleTwoFactor = async () => {
    const next = !data.twoFactor.enabled;
    const result = (await mutation.setTwoFactor?.(next)) as
      | { data?: { recoveryCodes?: string[] } }
      | undefined;
    await mutate();
    if (next) {
      setCodes(result?.data?.recoveryCodes ?? []);
      show(t("toast.twoFactorOn"), t("toast.twoFactorOnSub"));
    } else {
      show(t("toast.twoFactorOff"));
    }
  };

  const regenerate = async () => {
    const result = (await mutation.regenerateCodes?.()) as
      | { data?: { recoveryCodes?: string[] } }
      | undefined;
    await mutate();
    setCodes(result?.data?.recoveryCodes ?? []);
    show(t("toast.codesRegenerated"));
  };

  const createToken = async (values: FormValues) => {
    const result = (await mutation.createToken?.({
      name: values.name,
      expiresInDays: Number(values.expiresInDays ?? 90),
    })) as { data?: { secret?: string } } | undefined;
    await mutate();
    setSecret(result?.data?.secret ?? null);
    show(t("toast.tokenCreated"));
  };

  const revokeToken = async (token: Token) => {
    await mutation.revokeToken?.(token.id);
    await mutate();
    show(t("toast.tokenRevoked"), t("toast.tokenRevokedSub", { name: token.name }));
  };

  const confirmRevokeSession = async () => {
    if (!pendingRevoke) return;
    await mutation.revokeSession?.(pendingRevoke.id);
    await mutate();
    show(t("toast.sessionRevoked"), pendingRevoke.device);
    setPendingRevoke(null);
  };

  const signOutAll = async () => {
    await mutation.revokeOtherSessions?.();
    await mutate();
    show(t("toast.signedOutAll"), t("toast.signedOutAllSub"));
  };

  const toggleNotification = async (key: string) => {
    await mutation.setNotifications?.({ [key]: !data.notifications[key] });
    await mutate();
    show(t("toast.prefsSaved"));
  };

  const addRecipient = async (values: FormValues) => {
    await mutation.addRecipient?.(String(values.email));
    await mutate();
    show(t("toast.recipientAdded"), t("toast.recipientAddedSub", { email: values.email }));
  };

  const removeRecipient = async (recipient: Recipient) => {
    await mutation.removeRecipient?.(recipient.id);
    await mutate();
    show(t("toast.recipientRemoved"));
  };

  const copy = async (text: string, message: string) => {
    await navigator.clipboard.writeText(text);
    show(message);
  };

  const twoFactorOn = data.twoFactor.enabled;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Security score */}
      <SectionCard>
        <Box
          sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 11.5, color: "text.disabled", fontWeight: 600 }}>
              {t("score.label")}
            </Typography>
            <Typography
              sx={{
                fontSize: 30,
                fontWeight: 800,
                lineHeight: 1.15,
                color: twoFactorOn
                  ? "var(--mui-palette-success-light)"
                  : "var(--mui-palette-warning-light)",
              }}
            >
              {data.score}%
            </Typography>
            <Box sx={{ mt: "10px", maxWidth: 420 }}>
              <Meter
                percent={data.score}
                color={twoFactorOn ? "var(--mui-palette-success-light)" : undefined}
              />
            </Box>
            <Box sx={{ display: "flex", gap: "16px", flexWrap: "wrap", mt: "14px" }}>
              {data.checks.map((check) => (
                <Box key={check.key} sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <IconRenderer
                    name={check.ok ? "check-circle" : "warning"}
                    size={15}
                    sx={{
                      color: check.ok
                        ? "var(--mui-palette-success-light)"
                        : "var(--mui-palette-warning-light)",
                    }}
                  />
                  <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                    {t(check.label)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
          {!twoFactorOn ? (
            <Button
              variant="contained"
              onClick={toggleTwoFactor}
              startIcon={<IconRenderer name="shield" size={17} />}
            >
              {t("score.cta")}
            </Button>
          ) : null}
        </Box>
      </SectionCard>

      {/* Authentication */}
      <SectionCard>
        <CardHeader title={t("auth.title")} />
        <ListRow
          title={t("password.title")}
          meta={t("password.meta", {
            changed: data.password.changed,
            strength: data.password.strength,
          })}
          action={
            <Button variant="outlined" onClick={() => passwordModal.open()}>
              {t("password.change")}
            </Button>
          }
        />
        <ListRow
          title={t("twoFactor.title")}
          meta={
            twoFactorOn
              ? [
                  t("twoFactor.recoveryAvailable"),
                  data.twoFactor.verified
                    ? t("twoFactor.lastVerified", { when: data.twoFactor.verified })
                    : null,
                  data.twoFactor.generated
                    ? t("twoFactor.generated", { when: data.twoFactor.generated })
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")
              : t("twoFactor.apps")
          }
          chips={
            <Chip
              variant="soft"
              size="small"
              color={twoFactorOn ? "success" : "warning"}
              label={twoFactorOn ? t("twoFactor.enabled") : t("twoFactor.disabled")}
            />
          }
          action={
            <Box sx={{ display: "flex", gap: "8px", flex: "none" }}>
              {twoFactorOn ? (
                <>
                  <Button variant="outlined" onClick={() => setCodes(data.twoFactor.recoveryCodes)}>
                    {t("twoFactor.viewCodes")}
                  </Button>
                  <Button variant="outlined" onClick={regenerate}>
                    {t("twoFactor.regenerate")}
                  </Button>
                </>
              ) : null}
              <Button variant={twoFactorOn ? "outlined" : "contained"} onClick={toggleTwoFactor}>
                {twoFactorOn ? t("twoFactor.disable") : t("twoFactor.enable")}
              </Button>
            </Box>
          }
        />
        <ListRow
          title={t("sso.title")}
          meta={t("sso.meta")}
          chips={<Chip variant="soft" size="small" color="warning" label={t("sso.badge")} />}
          action={<Button variant="outlined">{t("sso.upgrade")}</Button>}
        />
      </SectionCard>

      {/* Active sessions */}
      <SectionCard>
        <CardHeader
          title={t("sessions.title")}
          subtitle={t("sessions.subtitle")}
          action={
            <Link href="/audit-log" sx={{ fontSize: 12 }}>
              {t("sessions.viewLog")}
            </Link>
          }
        />
        {data.sessions.map((session) => (
          <ListRow
            key={session.id}
            icon={<IconRenderer name={session.icon} size={19} />}
            title={session.device}
            meta={session.meta}
            chips={session.chips.map((chip) => (
              <Chip
                key={chip}
                variant="soft"
                size="small"
                color={CHIP_COLORS[chip] ?? "default"}
                label={t(`chips.${chip}`)}
              />
            ))}
            action={
              session.isCurrent ? null : (
                <Button color="error" onClick={() => setPendingRevoke(session)}>
                  {t("sessions.revoke")}
                </Button>
              )
            }
          />
        ))}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            pt: "14px",
            mt: "4px",
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography sx={{ fontSize: 11.5, color: "text.disabled" }}>
            {t("sessions.signOutHint")}
          </Typography>
          <Button
            variant="outlined"
            color="error"
            onClick={signOutAll}
            startIcon={<IconRenderer name="logout" size={16} />}
          >
            {t("sessions.signOutAll")}
          </Button>
        </Box>
      </SectionCard>

      {/* Login history */}
      <SectionCard>
        <CardHeader title={t("loginHistory.title")} subtitle={t("loginHistory.subtitle")} />
        <Box sx={{ display: "flex", gap: "8px", mb: "14px" }}>
          {["all", "success", "failed", "blocked"].map((option) => (
            <Chip
              key={option}
              variant="soft"
              size="small"
              label={t(`results.${option}`)}
              onClick={() => setResultFilter(option)}
              sx={{
                cursor: "pointer",
                ...(resultFilter === option
                  ? { bgcolor: "var(--mui-palette-surface-primarySoftBg)", color: "primary.main" }
                  : {}),
              }}
            />
          ))}
        </Box>
        <TableRenderer id={id} config={historyConfig} data={logins} />
      </SectionCard>

      {/* Personal access tokens */}
      <SectionCard>
        <CardHeader
          title={t("tokens.title")}
          subtitle={t("tokens.subtitle")}
          badge={<Chip variant="soft" size="small" label={t("tokens.badge")} />}
          action={
            <Button
              variant="contained"
              onClick={() => tokenModal.open()}
              startIcon={<IconRenderer name="add" size={17} />}
            >
              {t("tokens.create")}
            </Button>
          }
        />
        {data.tokens.length === 0 ? (
          <Typography sx={{ fontSize: 12.5, color: "text.disabled", py: "12px" }}>
            {t("tokens.empty")}
          </Typography>
        ) : (
          data.tokens.map((token) => (
            <ListRow
              key={token.id}
              icon={<IconRenderer name="key" size={18} />}
              title={token.name}
              meta={token.meta}
              action={
                <Button color="error" onClick={() => revokeToken(token)}>
                  {t("tokens.revoke")}
                </Button>
              }
            />
          ))
        )}
      </SectionCard>

      {/* Security notifications */}
      <SectionCard>
        <CardHeader
          title={t("notifications.title")}
          subtitle={t("notifications.subtitle", { email: data.email })}
        />
        <Box
          sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: "2px" }}
        >
          {config.notifications.map((item) => (
            <Check
              key={item.key}
              on={data.notifications[item.key] ?? false}
              label={t(item.label)}
              onClick={() => toggleNotification(item.key)}
            />
          ))}
        </Box>
        <Box sx={{ borderTop: "1px solid", borderColor: "divider", mt: "14px", pt: "14px" }}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, mb: "10px" }}>
            {t("recipients.title")}
          </Typography>
          <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap", mb: "12px" }}>
            {data.recipients.map((recipient) => (
              <Chip
                key={recipient.id}
                variant="soft"
                size="small"
                label={
                  recipient.owner
                    ? `${recipient.email} · ${t("recipients.owner")}`
                    : recipient.email
                }
                onDelete={recipient.owner ? undefined : () => removeRecipient(recipient)}
              />
            ))}
          </Box>
          <Box sx={{ maxWidth: 420 }}>
            <FormRenderer
              id={id}
              schema={config.recipientForm}
              onSubmit={addRecipient}
              submitLabel="recipients.add"
            />
          </Box>
        </Box>
      </SectionCard>

      {/* Modals */}
      <FormModal
        open={passwordModal.isOpen}
        onClose={passwordModal.close}
        id={id}
        title={t("changePassword.title")}
        description={t("changePassword.description")}
        schema={config.passwordForm}
        submitLabel="changePassword.submit"
        cancelLabel="cancel"
        onSubmit={changePassword}
      />

      <FormModal
        open={tokenModal.isOpen}
        onClose={tokenModal.close}
        id={id}
        title={t("tokenForm.title")}
        description={t("tokenForm.description")}
        schema={tokenSchema}
        submitLabel="tokenForm.submit"
        cancelLabel="cancel"
        onSubmit={createToken}
      />

      <Modal
        open={!!secret}
        onClose={() => setSecret(null)}
        title={t("tokenCreated.title")}
        description={t("tokenCreated.description")}
      >
        <Box
          sx={{
            fontFamily: "monospace",
            fontSize: 12.5,
            p: "12px 14px",
            borderRadius: "10px",
            bgcolor: "var(--mui-palette-surface-hoverSubtle)",
            wordBreak: "break-all",
          }}
        >
          {secret}
        </Box>
        <Typography sx={{ fontSize: 11.5, color: "warning.light", mt: "10px" }}>
          {t("tokenCreated.warning")}
        </Typography>
        <Box sx={{ display: "flex", gap: "10px", justifyContent: "flex-end", mt: "18px" }}>
          <Button variant="outlined" onClick={() => secret && copy(secret, t("toast.tokenCopied"))}>
            {t("tokenCreated.copy")}
          </Button>
          <Button variant="contained" onClick={() => setSecret(null)}>
            {t("tokenCreated.done")}
          </Button>
        </Box>
      </Modal>

      <Modal
        open={!!codes}
        onClose={() => setCodes(null)}
        title={t("recoveryCodes.title")}
        description={t("recoveryCodes.description")}
      >
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {(codes ?? []).map((code) => (
            <Box
              key={code}
              sx={{
                fontFamily: "monospace",
                fontSize: 13,
                p: "9px 12px",
                borderRadius: "8px",
                bgcolor: "var(--mui-palette-surface-hoverSubtle)",
                textAlign: "center",
              }}
            >
              {code}
            </Box>
          ))}
        </Box>
        <Box sx={{ display: "flex", gap: "10px", justifyContent: "flex-end", mt: "18px" }}>
          <Button
            variant="outlined"
            onClick={() => codes && copy(codes.join("\n"), t("toast.codesCopied"))}
          >
            {t("recoveryCodes.copy")}
          </Button>
          <Button variant="contained" onClick={() => setCodes(null)}>
            {t("recoveryCodes.done")}
          </Button>
        </Box>
      </Modal>

      <Modal
        open={!!pendingRevoke}
        onClose={() => setPendingRevoke(null)}
        title={t("revokeSession.title")}
        description={t("revokeSession.description", {
          device: pendingRevoke ? `${pendingRevoke.device} (${pendingRevoke.browser})` : "",
        })}
      >
        <Box sx={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={() => setPendingRevoke(null)}>
            {t("cancel")}
          </Button>
          <Button variant="contained" color="error" onClick={confirmRevokeSession}>
            {t("revokeSession.submit")}
          </Button>
        </Box>
      </Modal>

      <Toast toast={toast} onClose={clear} />
    </Box>
  );
}
