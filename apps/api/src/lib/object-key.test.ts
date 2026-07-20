import { describe, expect, it } from "bun:test";
import { isOwnedBy, isPublicType, objectKey, safeFilename } from "./object-key";

const ORG = "org_123";

describe("objectKey", () => {
  it("roots every key at the organization prefix", () => {
    const keys = [
      objectKey.organizationLogo(ORG),
      objectKey.memberAvatar(ORG, "usr_89"),
      objectKey.clientLogo(ORG, "cli_7"),
      objectKey.candidateResume(ORG, "can_1", "pdf"),
      objectKey.candidateCoverLetter(ORG, "can_1", "pdf"),
      objectKey.candidateAttachment(ORG, "can_1", "portfolio.pdf"),
      objectKey.jobDescription(ORG, "job_4", "pdf"),
      objectKey.report(ORG, "2026-07-20.pdf"),
      objectKey.template(ORG, "offer.docx"),
      objectKey.email(ORG, "header.png"),
      objectKey.import(ORG, "candidates.csv"),
      objectKey.export(ORG, "placements.csv"),
    ];
    for (const key of keys) expect(key.startsWith(`organizations/${ORG}/`)).toBe(true);
  });

  it("matches the agreed layout", () => {
    expect(objectKey.organizationLogo(ORG)).toBe("organizations/org_123/logo.webp");
    expect(objectKey.memberAvatar(ORG, "usr_89")).toBe(
      "organizations/org_123/members/usr_89/avatar.webp",
    );
    expect(objectKey.candidateResume(ORG, "can_123", "pdf")).toBe(
      "organizations/org_123/candidates/can_123/resume.pdf",
    );
    expect(objectKey.candidateAttachment(ORG, "can_123", "cover-letter.pdf")).toBe(
      "organizations/org_123/candidates/can_123/attachments/cover-letter.pdf",
    );
    expect(objectKey.jobDescription(ORG, "job_4", "pdf")).toBe(
      "organizations/org_123/jobs/job_4/jd.pdf",
    );
  });

  it("never uses the uploader's filename for candidate documents", () => {
    const key = objectKey.candidateResume(ORG, "can_1", "pdf");
    expect(key).not.toContain("John");
    expect(key.endsWith("/resume.pdf")).toBe(true);
  });
});

describe("safeFilename", () => {
  it("strips traversal and separators", () => {
    expect(safeFilename("../../etc/passwd")).toBe("etcpasswd");
    expect(safeFilename("John Doe Resume.pdf")).toBe("John-Doe-Resume.pdf");
    expect(safeFilename("")).toBe("file");
    expect(safeFilename("...")).toBe("file");
  });
});

describe("isOwnedBy", () => {
  it("accepts keys inside the caller's organization", () => {
    expect(isOwnedBy(objectKey.candidateResume(ORG, "can_1", "pdf"), ORG)).toBe(true);
  });

  it("rejects another organization's keys", () => {
    expect(isOwnedBy(objectKey.candidateResume("org_999", "can_1", "pdf"), ORG)).toBe(false);
  });

  it("rejects prefix-collision and traversal attempts", () => {
    // `org_1234` must not satisfy a check for `org_123`.
    expect(isOwnedBy("organizations/org_1234/logo.webp", ORG)).toBe(false);
    expect(isOwnedBy("organizations/org_123/../org_999/logo.webp", ORG)).toBe(false);
    expect(isOwnedBy("organizations/org_123/logo.webp", "")).toBe(false);
  });
});

describe("isPublicType", () => {
  it("keeps candidate documents private", () => {
    for (const type of ["resume", "cover-letter", "attachment", "report", "export"] as const) {
      expect(isPublicType(type)).toBe(false);
    }
  });

  it("allows branding assets to be public", () => {
    for (const type of ["logo", "avatar", "client-logo", "email"] as const) {
      expect(isPublicType(type)).toBe(true);
    }
  });
});
