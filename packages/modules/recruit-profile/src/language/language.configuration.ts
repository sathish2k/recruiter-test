import type { OptionSource } from "@recruit/shared";

export interface LanguageConfiguration {
  /** Server-sourced language list — same source as workspace. */
  languageSource: OptionSource;
  /** Date-format patterns (match the workspace enum). */
  dateOptions: string[];
  /** Time-format options (match the workspace enum). */
  timeOptions: string[];
}

export const LanguageConfiguration: LanguageConfiguration = {
  languageSource: { url: "/reference", path: "data.languages" },
  dateOptions: ["DD MMM YYYY", "DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"],
  timeOptions: ["12-hour (2:30 PM)", "24-hour (14:30)"],
};
