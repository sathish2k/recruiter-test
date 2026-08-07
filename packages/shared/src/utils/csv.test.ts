import { describe, expect, it } from "bun:test";
import { parseCsv } from "./csv";

describe("parseCsv", () => {
  it("reads a header row and its rows", () => {
    const { headers, rows } = parseCsv("First name,Email\nSanya,sanya@example.test\n");
    expect(headers).toEqual(["First name", "Email"]);
    expect(rows).toEqual([["Sanya", "sanya@example.test"]]);
  });

  it("keeps commas, newlines and escaped quotes inside a quoted field", () => {
    const { rows } = parseCsv('Name,Note\n"Rao, Sanya","said ""yes""\nthen left"\n');
    expect(rows).toEqual([["Rao, Sanya", 'said "yes"\nthen left']]);
  });

  it("drops blank lines and a trailing newline", () => {
    const { rows } = parseCsv("a,b\n1,2\n\n");
    expect(rows).toEqual([["1", "2"]]);
  });
});
