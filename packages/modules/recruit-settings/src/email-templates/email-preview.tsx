"use client";

// Deliberate non-theme colours throughout. This block emulates a mail client
// on a light background, not app chrome — theming it would misrepresent what
// recipients actually see. The palette is kept in step with the server-side
// renderer (apps/api/src/services/email-render.service.ts) so the preview and
// the delivered email are the same email.

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { BrandLogo, BrandWordmark } from "@recruit/shared";
import type { EmailTemplate } from "./email-templates.component";

const INBOX = {
  page: "#E9E6E1",
  chrome: "#F7F5F2",
  chromeBorder: "#DAD4C9",
  subject: "#1E1D1A",
  sender: "#2A2A26",
  muted: "#8B8880",
  faint: "#A39E94",
} as const;

const EMAIL = {
  card: "#FFFFFF",
  headerBg: "#211E1B",
  heading: "#211E1B",
  text: "#3D3A34",
  rule: "#EDE7DC",
  accent: "#E4560F",
  accentText: "#B4530C",
  panelBorder: "#D3C9B8",
  footerText: "#6E6B64",
} as const;

interface PreviewDraft {
  subject: string;
  preheader: string;
  heading: string;
  cta: string;
  bodyText: string;
}

export interface EmailPreviewProps {
  template: EmailTemplate;
  draft: PreviewDraft;
  sample: Record<string, string>;
  device: "desktop" | "mobile";
  /** Sender shown in the inbox row — the product, not the agency. */
  fromName: string;
  fromEmail: string;
  postalAddress: string;
  labels: {
    to: string;
    justNow: string;
    codeLabel: string;
    fallback: string;
    footerWhy: string;
  };
}

function fill(text: string, sample: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) => sample[key] ?? match);
}

/** "Troy Consulting" → TC; a single word takes its first and last letter
 * ("HirePilotX" → HX), which is how the design draws the sender avatar. */
function initials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  if (!words.length) return "?";
  if (words.length === 1) {
    const word = words[0] as string;
    return `${word[0]}${word.length > 1 ? word[word.length - 1] : ""}`.toUpperCase();
  }
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

export function EmailPreview({
  template,
  draft,
  sample,
  device,
  fromName,
  fromEmail,
  postalAddress,
  labels,
}: EmailPreviewProps) {
  const paragraphs = draft.bodyText
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const actionUrl = fill(template.ctaUrl, sample);
  const hasAction = Boolean(actionUrl) && !actionUrl.includes("{");
  const code = template.variables.includes("code") ? sample.code : "";
  const recipient = template.sampleTo || "you@example.com";

  return (
    <Box
      sx={{
        background: INBOX.page,
        borderRadius: "14px",
        p: "24px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: device === "desktop" ? 460 : 330,
          maxWidth: "100%",
          transition: "width .25s",
        }}
      >
        {/* Inbox row — the mail client's own chrome, not part of the email. */}
        <Box
          sx={{
            background: INBOX.chrome,
            border: `1px solid ${INBOX.chromeBorder}`,
            borderBottom: "none",
            borderRadius: "12px 12px 0 0",
            p: "11px 14px",
            display: "flex",
            alignItems: "center",
            gap: "9px",
          }}
        >
          <Box
            sx={{
              width: 26,
              height: 26,
              flex: "none",
              borderRadius: "999px",
              background: "#5B3A1F",
              color: "#FFC79A",
              display: "grid",
              placeItems: "center",
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            {initials(fromName)}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: INBOX.sender }} noWrap>
              {fromName}{" "}
              <Box component="span" sx={{ color: INBOX.muted, fontWeight: 400 }}>
                &lt;{fromEmail}&gt;
              </Box>
            </Typography>
            <Typography sx={{ fontSize: 10.5, color: INBOX.muted }} noWrap>
              {labels.to} {recipient}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 10, color: INBOX.faint, flex: "none" }}>
            {labels.justNow}
          </Typography>
        </Box>

        <Box
          sx={{
            background: INBOX.chrome,
            borderLeft: `1px solid ${INBOX.chromeBorder}`,
            borderRight: `1px solid ${INBOX.chromeBorder}`,
            p: "0 14px 12px",
          }}
        >
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: INBOX.subject, lineHeight: 1.4 }}>
            {fill(draft.subject, sample)}
          </Typography>
          <Typography sx={{ fontSize: 11, color: INBOX.muted, mt: "3px" }} noWrap>
            {fill(draft.preheader, sample)}
          </Typography>
        </Box>

        {/* The email itself. */}
        <Box
          sx={{
            background: EMAIL.card,
            borderRadius: "0 0 12px 12px",
            overflow: "hidden",
            boxShadow: "0 12px 34px rgba(0,0,0,.16)",
          }}
        >
          {/* The same mark + wordmark lockup the sent email carries. */}
          <Box
            sx={{
              background: EMAIL.headerBg,
              p: "18px 28px",
              display: "flex",
              alignItems: "center",
              gap: "9px",
              color: "#FFFFFF",
            }}
          >
            <BrandLogo size={21} />
            <BrandWordmark fontSize={13} />
          </Box>

          <Box sx={{ p: "26px 28px 24px" }}>
            <Typography
              sx={{
                fontSize: 19,
                fontWeight: 700,
                letterSpacing: "-.01em",
                lineHeight: 1.3,
                color: EMAIL.heading,
              }}
            >
              {fill(draft.heading, sample)}
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: "13px", mt: "16px" }}>
              {paragraphs.map((paragraph, index) => (
                <Typography
                  // biome-ignore lint/suspicious/noArrayIndexKey: preview paragraphs are positional and non-reorderable.
                  key={index}
                  sx={{
                    fontSize: 13.5,
                    lineHeight: 1.68,
                    color: EMAIL.text,
                    whiteSpace: "pre-line",
                  }}
                >
                  {fill(paragraph, sample)}
                </Typography>
              ))}
            </Box>

            {code ? (
              <Box
                sx={{
                  background: INBOX.chrome,
                  border: `1px dashed ${EMAIL.panelBorder}`,
                  borderRadius: "12px",
                  p: "16px",
                  mt: "18px",
                  textAlign: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: ".11em",
                    color: INBOX.muted,
                  }}
                >
                  {labels.codeLabel}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                    fontSize: 26,
                    fontWeight: 700,
                    letterSpacing: ".22em",
                    color: EMAIL.heading,
                    mt: "8px",
                  }}
                >
                  {code}
                </Typography>
              </Box>
            ) : null}

            {hasAction ? (
              <>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    background: EMAIL.accent,
                    color: "#FFFFFF",
                    fontSize: 13.5,
                    fontWeight: 700,
                    p: "13px 28px",
                    borderRadius: "999px",
                    boxShadow: "0 5px 14px rgba(228,86,15,.26)",
                    mt: "22px",
                  }}
                >
                  {fill(draft.cta, sample)}
                </Box>
                <Typography sx={{ fontSize: 11, lineHeight: 1.6, color: INBOX.faint, mt: "11px" }}>
                  {labels.fallback}
                  <br />
                  <Box component="span" sx={{ color: EMAIL.accentText, wordBreak: "break-all" }}>
                    {actionUrl}
                  </Box>
                </Typography>
              </>
            ) : null}

            {template.footer ? (
              <Typography
                sx={{
                  fontSize: 12,
                  lineHeight: 1.6,
                  color: INBOX.muted,
                  mt: "20px",
                  pt: "16px",
                  borderTop: `1px solid ${EMAIL.rule}`,
                  whiteSpace: "pre-line",
                }}
              >
                {fill(template.footer, sample)}
              </Typography>
            ) : null}
          </Box>

          <Box
            sx={{
              background: INBOX.chrome,
              borderTop: `1px solid ${EMAIL.rule}`,
              p: "16px 28px 18px",
            }}
          >
            <Typography sx={{ fontSize: 11, lineHeight: 1.6, color: EMAIL.footerText }}>
              {fill(labels.footerWhy, sample)}
            </Typography>
            <Typography sx={{ fontSize: 10.5, lineHeight: 1.6, color: INBOX.muted, mt: "7px" }}>
              {postalAddress}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
