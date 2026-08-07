export interface DashboardWelcomeConfig {
  /** Greeting keys picked by local hour; see the component's greetingKey(). */
  greeting: { morning: string; afternoon: string; evening: string };
  /** The muted line under the greeting. A translation key interpolated with
   * the whole summary row (`{{clients}}`, `{{openRoles}}`, …). */
  subtitle: string;
  /** Shown instead of `subtitle` while the workspace holds nothing. */
  emptySubtitle: string;
}

/**
 * The design's page head: a display-face greeting with one muted line of
 * workspace facts under it — no chips, no counters, no call to action. The
 * numbers on this screen live in the cards below; the head only says where you
 * are.
 */
export const DashboardWelcomeConfiguration: DashboardWelcomeConfig = {
  greeting: {
    morning: "greeting.morning",
    afternoon: "greeting.afternoon",
    evening: "greeting.evening",
  },
  subtitle: "subtitle",
  emptySubtitle: "emptySubtitle",
};
