import type { JsonSchema, PasswordStrengthConfig, TableRendererConfig } from "@recruit/shared";

export interface SecurityConfig {
  passwordForm: JsonSchema;
  tokenForm: JsonSchema;
  recipientForm: JsonSchema;
  loginHistory: TableRendererConfig;
  /** Checkbox grid in "Security notifications" — keys match the API's prefs. */
  notifications: { key: string; label: string }[];
}

/** Stricter than the app default: workspace passwords also want a symbol and a
 * longer minimum, and the meter reflects exactly this policy. */
const WORKSPACE_PASSWORD_STRENGTH: PasswordStrengthConfig = {
  levels: [
    { rule: "^.{10,}$", label: "strength.weak", fallback: "Weak", color: "error.main" },
    { rule: "[A-Z]", label: "strength.fair", fallback: "Fair", color: "warning.main" },
    { rule: "[0-9]", label: "strength.good", fallback: "Good", color: "info.main" },
    { rule: "[^A-Za-z0-9]", label: "strength.strong", fallback: "Strong", color: "success.main" },
  ],
};

export const SecurityConfiguration: SecurityConfig = {
  passwordForm: {
    type: "object",
    properties: {
      currentPassword: {
        type: "string",
        format: "password",
        title: "fields.current",
        placeholder: "fields.currentPlaceholder",
        icon: "lock",
      },
      newPassword: {
        type: "string",
        format: "password",
        minLength: 10,
        strengthMeter: WORKSPACE_PASSWORD_STRENGTH,
        title: "fields.new",
        placeholder: "fields.newPlaceholder",
        icon: "lock-reset",
      },
      confirmPassword: {
        type: "string",
        format: "password",
        matchesField: "newPassword",
        title: "fields.confirm",
        placeholder: "fields.confirmPlaceholder",
        icon: "lock-reset",
      },
    },
    required: ["currentPassword", "newPassword", "confirmPassword"],
    errorMessage: {
      required: {
        currentPassword: "fields.currentRequired",
        newPassword: "fields.newRequired",
        confirmPassword: "fields.confirmRequired",
      },
      matches: { confirmPassword: "fields.confirmMismatch" },
    },
  },

  tokenForm: {
    type: "object",
    properties: {
      name: {
        type: "string",
        title: "tokenForm.name",
        placeholder: "tokenForm.namePlaceholder",
        icon: "key",
      },
      expiresInDays: {
        type: "string",
        widget: "select",
        title: "tokenForm.expiry",
        enum: ["30", "90", "365", "0"],
        default: "90",
      },
    },
    required: ["name"],
    errorMessage: { required: { name: "tokenForm.nameRequired" } },
  },

  recipientForm: {
    type: "object",
    properties: {
      email: {
        type: "string",
        format: "email",
        title: "recipients.label",
        placeholder: "recipients.placeholder",
        icon: "mail",
      },
    },
    required: ["email"],
    errorMessage: { required: { email: "recipients.required" } },
  },

  loginHistory: {
    columns: [
      {
        label: { name: "loginHistory.when" },
        value: { type: "string", path: "when", sx: { fontWeight: 600 } },
      },
      {
        label: { name: "loginHistory.browser" },
        value: { type: "string", path: "browser", sx: { color: "text.secondary" } },
      },
      {
        label: { name: "loginHistory.location" },
        value: { type: "string", path: "location", sx: { color: "text.secondary" } },
      },
      {
        label: { name: "loginHistory.result" },
        value: {
          type: "status",
          path: "result",
          variant: "soft",
          labels: {
            success: "results.success",
            failed: "results.failed",
            blocked: "results.blocked",
          },
          colors: { success: "success", failed: "error", blocked: "warning" },
        },
      },
    ],
    emptyLabel: "loginHistory.empty",
    pagination: { pageSize: 5 },
  },

  notifications: [
    { key: "notifyNewDevice", label: "notifications.newDevice" },
    { key: "notifyPasswordChange", label: "notifications.passwordChange" },
    { key: "notifyTwoFactorDisabled", label: "notifications.twoFactorDisabled" },
    { key: "notifySsoChange", label: "notifications.ssoChange" },
  ],
};
