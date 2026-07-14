import type { JsonSchema } from "@recruit/shared";

export interface NotificationPref {
  key: string;
  title: string;
  description: string;
}

export interface PlanRow {
  icon: string;
  label: string;
  value: string;
}

export interface ProfileConfiguration {
  profileForm: JsonSchema;
  passwordForm: JsonSchema;
  notifications: NotificationPref[];
  plan: {
    badge: string;
    title: string;
    description: string;
    rows: PlanRow[];
  };
}

const TIMEZONES = [
  "Asia/Kolkata (IST)",
  "America/New_York (EST)",
  "America/Los_Angeles (PST)",
  "Europe/London (GMT)",
  "Europe/Berlin (CET)",
  "Asia/Singapore (SGT)",
  "Australia/Sydney (AEST)",
];

export const ProfileConfiguration: ProfileConfiguration = {
  profileForm: {
    type: "object",
    properties: {
      name: {
        type: "string",
        title: "profile.fields.name",
        placeholder: "profile.fields.namePlaceholder",
      },
      phone: {
        type: "string",
        title: "profile.fields.phone",
        placeholder: "profile.fields.phonePlaceholder",
      },
      timezone: {
        type: "string",
        title: "profile.fields.timezone",
        enum: TIMEZONES,
      },
    },
    required: ["name"],
    errorMessage: { required: { name: "profile.fields.nameRequired" } },
  },
  passwordForm: {
    type: "object",
    properties: {
      currentPassword: {
        type: "string",
        format: "password",
        title: "password.fields.current",
        placeholder: "password.fields.currentPlaceholder",
      },
      newPassword: {
        type: "string",
        format: "password",
        title: "password.fields.new",
        placeholder: "password.fields.newPlaceholder",
        minLength: 8,
        strengthMeter: true,
      },
    },
    required: ["currentPassword", "newPassword"],
    errorMessage: {
      required: {
        currentPassword: "password.fields.currentRequired",
        newPassword: "password.fields.newRequired",
      },
    },
  },
  notifications: [
    {
      key: "newApplicants",
      title: "notifications.items.newApplicants.title",
      description: "notifications.items.newApplicants.description",
    },
    {
      key: "interviewReminders",
      title: "notifications.items.interviewReminders.title",
      description: "notifications.items.interviewReminders.description",
    },
    {
      key: "weeklyDigest",
      title: "notifications.items.weeklyDigest.title",
      description: "notifications.items.weeklyDigest.description",
    },
    {
      key: "mentions",
      title: "notifications.items.mentions.title",
      description: "notifications.items.mentions.description",
    },
    {
      key: "productUpdates",
      title: "notifications.items.productUpdates.title",
      description: "notifications.items.productUpdates.description",
    },
  ],
  plan: {
    badge: "plan.badge",
    title: "plan.title",
    description: "plan.description",
    rows: [
      {
        icon: "group",
        label: "plan.rows.seats",
        value: "plan.rows.seatsValue",
      },
      {
        icon: "certificate",
        label: "plan.rows.payment",
        value: "plan.rows.paymentValue",
      },
      {
        icon: "pdf",
        label: "plan.rows.invoice",
        value: "plan.rows.invoiceValue",
      },
    ],
  },
};
