import { describe, expect, it } from "bun:test";
import {
  isBibliographicTerm,
  cleanPublisherText,
  applyPublisherFallback,
} from "../src/parsers/authors/special-cases.ts";

describe("isBibliographicTerm", () => {
  it("detects bibliographic terms", () => {
    expect(isBibliographicTerm("Collection")).toBe(true);
    expect(isBibliographicTerm("Editor")).toBe(true);
    expect(isBibliographicTerm("Editors")).toBe(true);
    expect(isBibliographicTerm("Compiler")).toBe(true);
    expect(isBibliographicTerm("Translator")).toBe(true);
  });

  it("rejects non-bibliographic terms", () => {
    expect(isBibliographicTerm("John Doe")).toBe(false);
    expect(isBibliographicTerm("SitePoint")).toBe(false);
  });
});

describe("cleanPublisherText", () => {
  it("removes year from publisher", () => {
    expect(cleanPublisherText("SitePoint, 2018")).toBe("SitePoint");
  });

  it("handles publisher without year", () => {
    expect(cleanPublisherText("O'Reilly")).toBe("O'Reilly");
  });
});

describe("applyPublisherFallback", () => {
  it("replaces bibliographic term with publisher", () => {
    const result = applyPublisherFallback(["Collection"], "SitePoint, 2018");
    expect(result).toEqual(["SitePoint"]);
  });

  it("keeps normal authors unchanged", () => {
    const result = applyPublisherFallback(["John Doe"], "SitePoint, 2018");
    expect(result).toEqual(["John Doe"]);
  });

  it("handles no publisher fallback", () => {
    const result = applyPublisherFallback(["Collection"], undefined);
    expect(result).toEqual(["Collection"]);
  });
});
