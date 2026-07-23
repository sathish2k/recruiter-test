export interface CalendarProvider {
  /** Integration provider key stored by the API. */
  key: string;
  /** Brand name — not translated. */
  name: string;
  icon: string;
}

export interface CalendarConfiguration {
  providers: CalendarProvider[];
}

export const CalendarConfiguration: CalendarConfiguration = {
  providers: [
    { key: "google-calendar", name: "Google Calendar", icon: "calendar_month" },
    { key: "outlook-calendar", name: "Outlook Calendar", icon: "event" },
  ],
};
