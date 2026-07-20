"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import { buildResolver, Field, FieldLabel, IconRenderer, Toast, useToast } from "@recruit/shared";
import { useMemo, useState } from "react";
import { type FieldValues, useForm } from "react-hook-form";
import type { ProfileConfiguration } from "./profile.configuration";

interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  timezone: string;
  role: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  notificationPrefs: Record<string, boolean>;
}

type Mutation = Record<string, ((body?: unknown) => Promise<unknown>) | undefined>;

export function ProfileComponent({ id }: { id: string }) {
  const { data, isLoading, mutation, mutate } = useFetch<Profile>(id);
  if (isLoading || !data) return null;
  return <ProfileEditor id={id} profile={data} mutation={mutation as Mutation} mutate={mutate} />;
}

function ProfileEditor({
  id,
  profile,
  mutation,
  mutate,
}: {
  id: string;
  profile: Profile;
  mutation: Mutation;
  mutate: () => Promise<unknown>;
}) {
  const { t } = useTranslation(id);
  const config = useConfiguration<ProfileConfiguration>(id);
  const { toast, show, clear } = useToast();
  const [prefs, setPrefs] = useState<Record<string, boolean>>(profile.notificationPrefs);

  const profileResolver = useMemo(
    () => (config ? buildResolver(config.profileForm) : undefined),
    [config],
  );
  const passwordResolver = useMemo(
    () => (config ? buildResolver(config.passwordForm) : undefined),
    [config],
  );

  const profileForm = useForm<FieldValues>({
    resolver: profileResolver,
    defaultValues: {
      name: profile.name,
      phone: profile.phone,
      timezone: profile.timezone,
    },
    mode: "onTouched",
  });
  const passwordForm = useForm<FieldValues>({
    resolver: passwordResolver,
    defaultValues: { currentPassword: "", newPassword: "" },
    mode: "onTouched",
  });

  if (!config) return null;

  const saveChanges = profileForm.handleSubmit(async (values) => {
    await mutation.update?.({ ...values, notificationPrefs: prefs });
    await mutate();
    show(t("toast.saved"), t("toast.savedSub"));
  });

  const updatePassword = passwordForm.handleSubmit(async (values) => {
    try {
      await mutation.updatePassword?.(values);
      passwordForm.reset({ currentPassword: "", newPassword: "" });
      show(t("toast.passwordSaved"), t("toast.passwordSavedSub"));
    } catch {
      show(t("toast.passwordError"), t("toast.passwordErrorSub"));
    }
  });

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr) 340px",
        gap: "18px",
        alignItems: "start",
        p: "22px 24px",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Card
          variant="base"
          sx={{
            p: "22px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{t("profile.title")}</Typography>
            <Typography sx={{ fontSize: 12, color: "text.disabled", mt: "2px" }}>
              {t("profile.description")}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                fontSize: 22,
                fontWeight: 700,
                bgcolor: profile.avatarBg,
                color: profile.avatarFg,
              }}
            >
              {profile.initials}
            </Avatar>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <Box sx={{ display: "flex", gap: "8px" }}>
                {/* ponytail: photo upload has no backend yet — no-op controls. */}
                <Button
                  variant="outlined"
                  startIcon={<IconRenderer name="upload" size={16} />}
                  onClick={() => {}}
                >
                  {t("profile.uploadPhoto")}
                </Button>
                <Button variant="text" onClick={() => {}}>
                  {t("profile.removePhoto")}
                </Button>
              </Box>
              <Typography sx={{ fontSize: 11.5, color: "text.disabled" }}>
                {t("profile.photoHint")}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "14px",
            }}
          >
            <Field
              name="name"
              prop={config.profileForm.properties.name}
              control={profileForm.control}
              t={t}
            />
            <Box sx={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              <FieldLabel label={t("profile.fields.email")} />
              <TextField value={profile.email} disabled fullWidth hiddenLabel />
              <Typography sx={{ fontSize: 11, color: "text.disabled", mt: "1px" }}>
                {t("profile.fields.emailHint")}
              </Typography>
            </Box>
            <Field
              name="phone"
              prop={config.profileForm.properties.phone}
              control={profileForm.control}
              t={t}
            />
            <Field
              name="timezone"
              prop={config.profileForm.properties.timezone}
              control={profileForm.control}
              t={t}
            />
          </Box>
        </Card>

        <Card
          variant="base"
          sx={{
            p: "22px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{t("password.title")}</Typography>
            <Typography sx={{ fontSize: 12, color: "text.disabled", mt: "2px" }}>
              {t("password.description")}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "14px",
            }}
          >
            <Field
              name="currentPassword"
              prop={config.passwordForm.properties.currentPassword}
              control={passwordForm.control}
              t={t}
            />
            <Field
              name="newPassword"
              prop={config.passwordForm.properties.newPassword}
              control={passwordForm.control}
              t={t}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            {/* ponytail: two-factor status is static — no 2FA system yet. */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "success.light",
              }}
            >
              <IconRenderer name="check-circle" size={16} />
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                {t("password.twoFactor")}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<IconRenderer name="lock-reset" size={16} />}
              loading={passwordForm.formState.isSubmitting}
              onClick={updatePassword}
            >
              {t("password.update")}
            </Button>
          </Box>
        </Card>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Card
          variant="base"
          sx={{
            p: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <Typography sx={{ fontSize: 14, fontWeight: 700, mb: "6px" }}>
            {t("notifications.title")}
          </Typography>
          {config.notifications.map((pref) => (
            <Box
              key={pref.key}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                py: "8px",
              }}
            >
              <Box>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>{t(pref.title)}</Typography>
                <Typography sx={{ fontSize: 11.5, color: "text.disabled", mt: "1px" }}>
                  {t(pref.description)}
                </Typography>
              </Box>
              <Switch
                checked={!!prefs[pref.key]}
                onChange={(e) =>
                  setPrefs((prev) => ({
                    ...prev,
                    [pref.key]: e.target.checked,
                  }))
                }
              />
            </Box>
          ))}
        </Card>

        <Card variant="accent" sx={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
            }}
          >
            <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{t("plan.title")}</Typography>
            <Chip variant="soft" color="primary" label={t("plan.badge")} />
          </Box>
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            {t("plan.description")}
          </Typography>
          {/* ponytail: billing is display-only — no payment system wired. */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {config.plan.rows.map((row) => (
              <Box
                key={row.label}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "text.secondary",
                  }}
                >
                  <IconRenderer name={row.icon} size={16} />
                  <Typography sx={{ fontSize: 12.5 }}>{t(row.label)}</Typography>
                </Box>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>{t(row.value)}</Typography>
              </Box>
            ))}
          </Box>
          <Button variant="outlined" fullWidth onClick={() => {}}>
            {t("plan.manage")}
          </Button>
        </Card>

        <Button
          variant="contained"
          fullWidth
          startIcon={<IconRenderer name="check" size={16} />}
          loading={profileForm.formState.isSubmitting}
          onClick={saveChanges}
        >
          {t("save")}
        </Button>
      </Box>

      <Toast toast={toast} onClose={clear} />
    </Box>
  );
}
