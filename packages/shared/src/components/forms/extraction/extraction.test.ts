import { describe, expect, test } from "bun:test";
import type { JsonSchema } from "../types";
import { applyExtraction } from "./apply";
import { extractionPlan, planToContract } from "./contract";

const schema: JsonSchema = {
  type: "object",
  properties: {
    firstName: { type: "string", extract: true, maxLength: 100 },
    email: { type: "string", format: "email", extract: true },
    phone: {
      type: "string",
      widget: "phone",
      extract: true,
      optionSource: { url: "/reference", path: "data.dialCodes" },
    },
    experienceYears: { type: "number", widget: "number", extract: true, minimum: 0, maximum: 60 },
    highestQualification: {
      type: "string",
      widget: "select",
      enum: ["bachelors", "masters"],
      enumL10n: "qualification",
      extract: true,
    },
    skillSet: { type: "array", widget: "chips", extract: true },
    education: {
      type: "array",
      widget: "repeater",
      extract: true,
      itemSchema: {
        institution: { type: "string" },
        fromYear: { type: "string" },
        currentlyPursuing: { type: "boolean", widget: "checkbox" },
      },
    },
    // Not marked — must never be requested or written.
    status: { type: "string", widget: "select", enum: ["new"] },
    // Marked but unusable: options come from the API.
    ownerId: {
      type: "string",
      widget: "select",
      extract: true,
      optionSource: { url: "/users", path: "data" },
    },
    resume: { type: "array", widget: "attachments", extract: true },
  },
};

const plan = extractionPlan(schema);
const named = (name: string) => plan.find((f) => f.name === name);

describe("extraction contract", () => {
  test("includes only fields marked `extract`", () => {
    expect(named("firstName")).toBeDefined();
    expect(named("status")).toBeUndefined();
  });

  test("skips remote-id and file fields even when marked", () => {
    expect(named("ownerId")).toBeUndefined();
    expect(named("resume")).toBeUndefined();
  });

  test("keeps phone, whose optionSource is the dial-code list", () => {
    expect(named("phone")?.kind).toBe("phone");
  });

  test("derives the kind from the widget", () => {
    expect(named("email")?.kind).toBe("email");
    expect(named("skillSet")?.kind).toBe("stringList");
    expect(named("education")?.kind).toBe("rows");
    expect(named("highestQualification")?.kind).toBe("enum");
  });

  test("wire contract sends storable option ids and row shapes", () => {
    const wire = planToContract(plan);
    const qualification = wire.find((f) => f.name === "highestQualification");
    expect(qualification?.enum).toEqual(["bachelors", "masters"]);

    const education = wire.find((f) => f.name === "education");
    expect(education?.itemType).toBe("object");
    expect(education?.itemFields?.map((f) => f.name)).toEqual([
      "institution",
      "fromYear",
      "currentlyPursuing",
    ]);
  });

  test("defaults a hint from the field name", () => {
    const wire = planToContract(plan);
    expect(wire.find((f) => f.name === "firstName")?.hint).toBe("first name");
  });
});

describe("applying extracted values", () => {
  const apply = (extracted: Record<string, unknown>, current: Record<string, unknown> = {}) =>
    applyExtraction(plan, extracted, current);

  test("never overwrites a value the user already entered", () => {
    const { values } = apply({ firstName: "Parsed" }, { firstName: "Typed" });
    expect(values.firstName).toBeUndefined();
  });

  test("fills a blank field", () => {
    const { values, filled } = apply({ firstName: "Ananya" }, { firstName: "" });
    expect(values.firstName).toBe("Ananya");
    expect(filled).toContain("firstName");
  });

  test("drops a malformed email rather than blocking the save", () => {
    expect(apply({ email: "not-an-email" }).values.email).toBeUndefined();
    expect(apply({ email: "a@b.co" }).values.email).toBe("a@b.co");
  });

  test("stores a phone in the widget's format and drops one without a country code", () => {
    expect(apply({ phone: "+91 98450 12340" }).values.phone).toBe("+91 9845012340");
    expect(apply({ phone: "9845012340" }).values.phone).toBeUndefined();
  });

  test("drops an out-of-range number instead of clamping it", () => {
    expect(apply({ experienceYears: 900 }).values.experienceYears).toBeUndefined();
    expect(apply({ experienceYears: 7 }).values.experienceYears).toBe(7);
  });

  test("maps an enum answer onto the configured id, and drops a non-member", () => {
    expect(apply({ highestQualification: "Bachelors" }).values.highestQualification).toBe(
      "bachelors",
    );
    expect(apply({ highestQualification: "PhD" }).values.highestQualification).toBeUndefined();
  });

  test("keeps only string items in a chips list", () => {
    expect(apply({ skillSet: ["React", { x: 1 }, "", "React"] }).values.skillSet).toEqual([
      "React",
    ]);
  });

  test("seeds every repeater row with the full key set", () => {
    const { values } = apply({ education: [{ institution: "IIT Bombay" }] });
    expect(values.education).toEqual([
      { institution: "IIT Bombay", fromYear: "", currentlyPursuing: false },
    ]);
  });

  test("drops rows that carry nothing", () => {
    expect(apply({ education: [{}, { nope: 1 }] }).values.education).toBeUndefined();
  });

  test("ignores keys that were never requested", () => {
    expect(apply({ status: "placed" } as Record<string, unknown>).values.status).toBeUndefined();
  });
});
