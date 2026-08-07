"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { FieldShell, IconRenderer, Modal } from "@recruit/shared";
import type { DraftChange } from "./permissions.model";
import type { Translate } from "./permissions.types";

/** Every dialog opens the same way: an icon slab, a title, a blurb, then body. */
function DialogHead({
  icon,
  tone,
  title,
  blurb,
}: {
  icon: string;
  tone: "primary" | "warning" | "error";
  title: string;
  blurb: string;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: "13px", mb: "16px" }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          flex: "none",
          borderRadius: "11px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor:
            tone === "error"
              ? "surface.errorSoftBg"
              : tone === "warning"
                ? "surface.warningSoftBg"
                : "surface.primarySoftBg",
          color:
            tone === "error"
              ? "surface.errorFg"
              : tone === "warning"
                ? "surface.warningFg"
                : "surface.primarySoftFg",
        }}
      >
        <IconRenderer name={icon} size={20} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 17, fontWeight: 700, letterSpacing: "-.01em" }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: 12.5, lineHeight: 1.65, color: "text.secondary", mt: "4px" }}>
          {blurb}
        </Typography>
      </Box>
    </Box>
  );
}

function Point({
  icon,
  tone,
  text,
}: {
  icon: string;
  tone: "warning" | "error" | "muted";
  text: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: "10px",
        p: "12px 14px",
        borderRadius: "10px",
        fontSize: 12.5,
        lineHeight: 1.6,
        color: "text.primary",
        bgcolor:
          tone === "error"
            ? "surface.errorSoftBg"
            : tone === "warning"
              ? "surface.warningSoftBg"
              : "surface.inset",
      }}
    >
      <IconRenderer
        name={icon}
        size={17}
        sx={{
          flex: "none",
          mt: "2px",
          color:
            tone === "error"
              ? "surface.errorFg"
              : tone === "warning"
                ? "surface.warningFg"
                : "text.disabled",
        }}
      />
      <Box>{text}</Box>
    </Box>
  );
}

function Actions({
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
  disabled,
  title,
  danger,
  busy,
}: {
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  disabled?: boolean;
  title?: string;
  danger?: boolean;
  busy?: boolean;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: "10px",
        mt: "20px",
      }}
    >
      <Button variant="outlined" onClick={onCancel}>
        {cancelLabel}
      </Button>
      <Button
        variant="contained"
        color={danger ? "error" : "primary"}
        onClick={onConfirm}
        disabled={disabled}
        loading={busy}
        title={title}
      >
        {confirmLabel}
      </Button>
    </Box>
  );
}

/** Review-and-save: the changes, listed, before they reach anyone's session. */
export function SaveDialog({
  open,
  onClose,
  onConfirm,
  changes,
  roleLabel,
  memberCount,
  busy,
  t,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  changes: DraftChange[];
  roleLabel: string;
  memberCount: string;
  busy: boolean;
  t: Translate;
}) {
  const shown = changes.slice(0, 8);
  const rest = changes.length - shown.length;
  const label = t(changes.length === 1 ? "savebar.change" : "savebar.changes", {
    count: changes.length,
  });

  return (
    <Modal open={open} onClose={onClose} width={560}>
      <DialogHead
        icon="published-with-changes"
        tone="warning"
        title={t("dialogs.save.title", { changes: label, role: roleLabel })}
        blurb={t("dialogs.save.blurb", { members: memberCount })}
      />
      <Card variant="inset" sx={{ p: "14px 16px" }}>
        <Typography
          sx={{ fontSize: 10.5, fontWeight: 800, letterSpacing: ".07em", color: "text.secondary" }}
        >
          {t("dialogs.save.whatChanges")}
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", mt: "4px" }}>
          {shown.map((change) => (
            <Box
              key={`${change.added}-${change.text}`}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                py: "9px",
                borderTop: "1px dashed",
                borderColor: "divider",
                fontSize: 12.5,
              }}
            >
              <IconRenderer
                name={change.added ? "add-circle" : "remove-circle"}
                size={16}
                sx={{
                  flex: "none",
                  color: change.added ? "surface.successFg" : "surface.errorFg",
                }}
              />
              <Box sx={{ flex: 1, minWidth: 0, color: "text.primary" }}>{change.text}</Box>
            </Box>
          ))}
        </Box>
      </Card>
      {rest > 0 ? (
        <Box sx={{ mt: "10px" }}>
          <Point icon="more" tone="muted" text={t("dialogs.save.more", { count: rest })} />
        </Box>
      ) : null}
      <Actions
        cancelLabel={t("dialogs.cancel")}
        confirmLabel={t("dialogs.save.confirm")}
        onCancel={onClose}
        onConfirm={onConfirm}
        busy={busy}
      />
    </Modal>
  );
}

export interface RoleFormState {
  name: string;
  preset: string;
}

/** New role / duplicate role — the same dialog, minus the preset list when duplicating. */
export function RoleFormDialog({
  open,
  mode,
  sourceLabel,
  value,
  onChange,
  presets,
  nameTaken,
  onClose,
  onConfirm,
  busy,
  t,
}: {
  open: boolean;
  mode: "create" | "duplicate";
  sourceLabel: string;
  value: RoleFormState;
  onChange: (next: RoleFormState) => void;
  presets: { id: string; label: string; detail: string }[];
  nameTaken: boolean;
  onClose: () => void;
  onConfirm: () => void;
  busy: boolean;
  t: Translate;
}) {
  const duplicate = mode === "duplicate";
  const ready = !!value.name.trim() && !nameTaken;

  return (
    <Modal open={open} onClose={onClose} width={560}>
      <DialogHead
        icon={duplicate ? "content-copy" : "add-circle"}
        tone="primary"
        title={
          duplicate
            ? t("dialogs.duplicate.title", { role: sourceLabel })
            : t("dialogs.create.title")
        }
        blurb={
          duplicate
            ? t("dialogs.duplicate.blurb", { role: sourceLabel })
            : t("dialogs.create.blurb")
        }
      />

      <Box sx={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <FieldShell
          label={t("dialogs.create.nameLabel")}
          error={nameTaken ? t("dialogs.create.nameTaken", { name: value.name.trim() }) : undefined}
        >
          <TextField
            fullWidth
            hiddenLabel
            autoFocus
            value={value.name}
            error={nameTaken}
            placeholder={t("dialogs.create.namePlaceholder")}
            onChange={(event) => onChange({ ...value, name: event.target.value })}
          />
        </FieldShell>

        {duplicate ? null : (
          <Box>
            <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: "text.primary", mb: "6px" }}>
              {t("dialogs.create.startFrom")}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {presets.map((preset) => {
                const active = value.preset === preset.id;
                return (
                  <Card
                    key={preset.id}
                    variant="selectable"
                    data-selected={active}
                    onClick={() => onChange({ ...value, preset: preset.id })}
                    sx={{ display: "flex", alignItems: "flex-start", gap: "11px", p: "12px 14px" }}
                  >
                    <Box
                      sx={{
                        width: 18,
                        height: 18,
                        flex: "none",
                        mt: "1px",
                        borderRadius: "999px",
                        border: "2px solid",
                        borderColor: active ? "primary.main" : "surface.controlOutline",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {active ? (
                        <Box
                          sx={{
                            width: 9,
                            height: 9,
                            borderRadius: "999px",
                            bgcolor: "primary.main",
                          }}
                        />
                      ) : null}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{preset.label}</Typography>
                      <Typography
                        sx={{
                          fontSize: 11.5,
                          lineHeight: 1.55,
                          color: "text.secondary",
                          mt: "1px",
                        }}
                      >
                        {preset.detail}
                      </Typography>
                    </Box>
                  </Card>
                );
              })}
            </Box>
          </Box>
        )}
      </Box>

      <Actions
        cancelLabel={t("dialogs.cancel")}
        confirmLabel={duplicate ? t("dialogs.duplicate.confirm") : t("dialogs.create.confirm")}
        onCancel={onClose}
        onConfirm={onConfirm}
        disabled={!ready}
        busy={busy}
        title={ready ? undefined : t("dialogs.create.nameFirst")}
      />
    </Modal>
  );
}

/** Delete: type-to-confirm, because it moves people as a side effect. */
export function DeleteRoleDialog({
  open,
  roleLabel,
  reassignLabel,
  memberCount,
  typed,
  onTyped,
  onClose,
  onConfirm,
  busy,
  t,
}: {
  open: boolean;
  roleLabel: string;
  reassignLabel: string;
  memberCount: string;
  typed: string;
  onTyped: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  busy: boolean;
  t: Translate;
}) {
  const ready = typed.trim().toLowerCase() === roleLabel.toLowerCase();

  return (
    <Modal open={open} onClose={onClose} width={520}>
      <DialogHead
        icon="delete-forever"
        tone="error"
        title={t("dialogs.delete.title", { role: roleLabel })}
        blurb={t("dialogs.delete.blurb", { members: memberCount })}
      />
      <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <Point
          icon="swap-horiz"
          tone="warning"
          text={t("dialogs.delete.moves", { role: reassignLabel })}
        />
        <Point icon="history" tone="muted" text={t("dialogs.delete.audited")} />
        <Point icon="block" tone="error" text={t("dialogs.delete.irreversible")} />
        <FieldShell label={t("dialogs.delete.confirmType", { role: roleLabel })}>
          <TextField
            fullWidth
            hiddenLabel
            value={typed}
            onChange={(event) => onTyped(event.target.value)}
          />
        </FieldShell>
      </Box>
      <Actions
        cancelLabel={t("dialogs.delete.cancel")}
        confirmLabel={t("dialogs.delete.confirm")}
        onCancel={onClose}
        onConfirm={onConfirm}
        disabled={!ready}
        danger
        busy={busy}
        title={ready ? undefined : t("dialogs.delete.typeFirst")}
      />
    </Modal>
  );
}
