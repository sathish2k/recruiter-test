/**
 * Object keys for the R2 bucket. Every key is rooted at
 * `organizations/{organizationId}/`, so tenant isolation is a prefix check —
 * see `isOwnedBy`.
 *
 *   organizations/{orgId}/logo.webp
 *   organizations/{orgId}/members/{memberId}/avatar.webp
 *   organizations/{orgId}/candidates/{candidateId}/resume.pdf
 *   organizations/{orgId}/candidates/{candidateId}/cover-letter.pdf
 *   organizations/{orgId}/candidates/{candidateId}/attachments/{file}
 *   organizations/{orgId}/clients/{clientId}/logo.webp
 *   organizations/{orgId}/jobs/{jobId}/jd.pdf
 *   organizations/{orgId}/reports|templates|emails|imports|exports/{file}
 */

export type AssetType =
  | "logo"
  | "avatar"
  | "resume"
  | "cover-letter"
  | "attachment"
  | "client-logo"
  | "jd"
  | "report"
  | "template"
  | "email"
  | "import"
  | "export";

export type EntityType =
  | "organization"
  | "member"
  | "candidate"
  | "client"
  | "job"
  | "report"
  | "template"
  | "email"
  | "import"
  | "export";

/** Assets safe to serve straight off the public custom domain. Everything else
 * is private and only ever reachable through a signed URL. */
const PUBLIC_TYPES = new Set<AssetType>(["logo", "avatar", "client-logo", "email"]);

export function isPublicType(type: AssetType): boolean {
  return PUBLIC_TYPES.has(type);
}

export function orgRoot(organizationId: string): string {
  return `organizations/${organizationId}`;
}

/**
 * Strips anything that could escape the intended prefix or collide across
 * platforms. Never used for candidate documents — those get deterministic
 * names — but attachments and imports keep a recognisable filename.
 */
export function safeFilename(name: string): string {
  const cleaned = name
    .normalize("NFKD")
    .replace(/[^\w.\- ]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^[.-]+/, "")
    .slice(0, 120);
  return cleaned || "file";
}

export function extensionFor(contentType: string, fallback = "bin"): string {
  const map: Record<string, string> = {
    "image/webp": "webp",
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/svg+xml": "svg",
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "text/csv": "csv",
    "application/json": "json",
  };
  return map[contentType] ?? fallback;
}

export const objectKey = {
  organizationLogo: (orgId: string) => `${orgRoot(orgId)}/logo.webp`,

  memberAvatar: (orgId: string, memberId: string) =>
    `${orgRoot(orgId)}/members/${memberId}/avatar.webp`,

  clientLogo: (orgId: string, clientId: string) =>
    `${orgRoot(orgId)}/clients/${clientId}/logo.webp`,

  /** Deterministic — never the uploader's filename, which is kept as metadata. */
  candidateResume: (orgId: string, candidateId: string, ext: string) =>
    `${orgRoot(orgId)}/candidates/${candidateId}/resume.${ext}`,

  candidateCoverLetter: (orgId: string, candidateId: string, ext: string) =>
    `${orgRoot(orgId)}/candidates/${candidateId}/cover-letter.${ext}`,

  candidateAttachment: (orgId: string, candidateId: string, filename: string) =>
    `${orgRoot(orgId)}/candidates/${candidateId}/attachments/${safeFilename(filename)}`,

  jobDescription: (orgId: string, jobId: string, ext: string) =>
    `${orgRoot(orgId)}/jobs/${jobId}/jd.${ext}`,

  report: (orgId: string, filename: string) =>
    `${orgRoot(orgId)}/reports/${safeFilename(filename)}`,

  template: (orgId: string, filename: string) =>
    `${orgRoot(orgId)}/templates/${safeFilename(filename)}`,

  email: (orgId: string, filename: string) => `${orgRoot(orgId)}/emails/${safeFilename(filename)}`,

  import: (orgId: string, filename: string) =>
    `${orgRoot(orgId)}/imports/${safeFilename(filename)}`,

  export: (orgId: string, filename: string) =>
    `${orgRoot(orgId)}/exports/${safeFilename(filename)}`,
};

/** Guards every read/delete: a key must sit under the caller's own org prefix. */
export function isOwnedBy(key: string, organizationId: string): boolean {
  if (!organizationId) return false;
  if (key.includes("..")) return false;
  return key.startsWith(`${orgRoot(organizationId)}/`);
}
