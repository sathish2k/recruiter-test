"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import {
  useConfiguration,
  useFetch,
  useLocale,
  usePortalRouter,
  useTranslation,
} from "@recruit/sdk";
import {
  type FormValues,
  FormWithSectionsRenderer,
  IconRenderer,
  type UploadValue,
  useFormatters,
  useToast,
} from "@recruit/shared";
import type { ProfileFormConfiguration } from "./profile-form.configuration";

interface Workspace {
  name: string;
  role: string;
  members: number;
  joinedAt: string | null;
  clientAccessCount: number | null;
  website: string | null;
}

interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  timezone: string;
  signature: string;
  image: string;
  role: string;
  workspace: Workspace | null;
}

export function ProfileFormComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<ProfileFormConfiguration>(id);
  const { data: profile, mutation, mutate, isLoading } = useFetch<Profile>(id);
  const { show } = useToast();
  const { setTimezone } = useLocale();

  if (!config.schema) return null;
  const loading = isLoading || !profile;

  const save = async (values: FormValues) => {
    const { avatar, email, ...rest } = values as FormValues & {
      avatar?: UploadValue;
      email?: string;
    };
    let image: string | undefined;
    if (avatar?.file) {
      const uploaded = (await mutation.uploadAvatar?.(avatar.file)) as
        | { data?: { url?: string | null } }
        | undefined;
      image = uploaded?.data?.url ?? undefined;
    }
    await mutation.update?.({ ...rest, ...(image !== undefined ? { image } : {}) });
    if (typeof rest.timezone === "string") setTimezone(rest.timezone);
    await mutate();
    show(t("toast.saved"), t("toast.savedSub"));
  };

  const defaultValues: FormValues = profile
    ? {
        avatar: { url: profile.image } as FormValues[string],
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        timezone: profile.timezone,
        signature: profile.signature,
      }
    : {};

  return (
    <Box>
      <FormWithSectionsRenderer
        key={profile?.id ?? "loading"}
        id={id}
        schema={config.schema}
        sections={config.sections}
        defaultValues={defaultValues}
        onSubmit={save}
        isLoading={loading}
        actionsPlacement="footer"
        submitLabel="actions.save"
        submitIcon="save"
        savedLabel="actions.saved"
        cancelLabel="actions.cancel"
        sidePanel={<WorkspaceCard id={id} config={config} workspace={profile?.workspace ?? null} />}
      />
    </Box>
  );
}

function WorkspaceCard({
  id,
  config,
  workspace,
}: {
  id: string;
  config: ProfileFormConfiguration;
  workspace: Workspace | null;
}) {
  const { t } = useTranslation(id);
  const { formatDate } = useFormatters();
  const router = usePortalRouter();

  if (!workspace) return null;

  const rows: { label: string; value: string }[] = [
    {
      label: t("workspace.rows.members"),
      value: t("workspace.rows.membersValue", { count: workspace.members }),
    },
    {
      label: t("workspace.rows.access"),
      value:
        workspace.clientAccessCount === null
          ? t("workspace.rows.accessAll")
          : t("workspace.rows.accessCount", { count: workspace.clientAccessCount }),
    },
    {
      label: t("workspace.rows.joined"),
      value: workspace.joinedAt ? formatDate(workspace.joinedAt) : "—",
    },
    { label: t("workspace.rows.url"), value: workspace.website ?? "—" },
  ];

  return (
    <Card variant="base" sx={{ p: "20px", display: "flex", flexDirection: "column" }}>
      <Typography sx={{ fontSize: 14, fontWeight: 700, mb: "13px" }}>
        {t("workspace.title")}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: "11px" }}>
        <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>{workspace.name}</Typography>
        <Chip
          variant="soft"
          color="primary"
          label={t(`workspace.roles.${workspace.role}`, workspace.role)}
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "9px",
          borderTop: "1px solid",
          borderColor: "divider",
          mt: "14px",
          pt: "13px",
        }}
      >
        {rows.map((row) => (
          <Box
            key={row.label}
            sx={{ display: "flex", justifyContent: "space-between", gap: "12px" }}
          >
            <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>{row.label}</Typography>
            <Typography
              sx={{
                fontSize: 12.5,
                fontWeight: 700,
                textAlign: "right",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {row.value}
            </Typography>
          </Box>
        ))}
      </Box>
      <Link
        component="button"
        type="button"
        onClick={() => router.push(config.workspace.settingsRouteId)}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          mt: "14px",
          fontSize: 12.5,
          fontWeight: 700,
          color: "warning.light",
          alignSelf: "flex-start",
        }}
      >
        {t("workspace.openSettings")}
        <IconRenderer name="arrow-forward" size={15} />
      </Link>
    </Card>
  );
}
