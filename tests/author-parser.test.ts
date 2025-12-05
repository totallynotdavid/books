import { describe, expect, it } from "bun:test";
import { parseAuthors } from "../src/parsers/authors/index.ts";

describe("parseAuthors", () => {
  it("handles empty input", () => {
    expect(parseAuthors("")).toEqual([]);
    expect(parseAuthors("  ")).toEqual([]);
  });

  it("handles single author", () => {
    expect(parseAuthors("Rob Isenberg")).toEqual(["Rob Isenberg"]);
  });

  it("handles LastName, FirstName format", () => {
    expect(parseAuthors("Sullivan, William")).toEqual(["William Sullivan"]);
  });

  it("handles lowercase names", () => {
    expect(parseAuthors("hu, yang")).toEqual(["Yang Hu"]);
  });

  it("handles multiple authors with (editor)", () => {
    const result = parseAuthors("Jaime González García, Artur Mizera (editor)");
    expect(result).toEqual(["Jaime González García", "Artur Mizera"]);
  });

  it("handles comma + and", () => {
    const result = parseAuthors("Ray Yao, Ada R. Swift, and Ruby C. Perl");
    expect(result).toEqual(["Ray Yao", "Ada R. Swift", "Ruby C. Perl"]);
  });

  it("handles semicolon-separated", () => {
    const result = parseAuthors("Maurya, Rahul; Maurya, Rahul");
    expect(result).toEqual(["Rahul Maurya", "Rahul Maurya"]);
  });

  it("handles bibliographic placeholder with publisher fallback", () => {
    const result = parseAuthors("coll.", "SitePoint, 2018");
    expect(result).toEqual(["SitePoint"]);
  });

  it("handles bracket notation", () => {
    const result = parseAuthors("Casey, Elle [Casey, Elle]");
    expect(result).toEqual(["Elle Casey"]);
  });

  it("handles comma-separated without 'and'", () => {
    const result = parseAuthors("Mighton, John, Jump Math");
    expect(result).toEqual(["John Mighton", "Jump Math"]);
  });

  it("handles URL as author", () => {
    const result = parseAuthors("https://www.tutorialspoint.com/");
    expect(result).toEqual(["https://www.tutorialspoint.com/"]);
  });

  it("handles 'By' prefix", () => {
    const result = parseAuthors("By Winston Churchill, Illustrated by J.H. Gardner Soper");
    expect(result).toEqual(["Winston Churchill", "J.H. Gardner Soper"]);
  });

  it("handles initials", () => {
    expect(parseAuthors("Martin J.")).toEqual(["Martin J."]);
  });

  it("handles Cyrillic period-delimited format", () => {
    const input = "Составитель - Sheila Pemberton. Русский Текст - И. Б. Соболева. Иллюстрации - Val Biro.";
    const result = parseAuthors(input);
    expect(result).toEqual(["Sheila Pemberton", "И. Б. Соболева", "Val Biro"]);
  });

  it("handles three-letter language codes", () => {
    expect(parseAuthors("Stahlin Friedrich")).toEqual(["Stahlin Friedrich"]);
  });

  it("handles & separator", () => {
    const result = parseAuthors("W. Richard Stevens & Stephen A. Rago");
    expect(result).toEqual(["W. Richard Stevens", "Stephen A. Rago"]);
  });

  it("handles honorific in 3-part tuple", () => {
    const result = parseAuthors("Chrysostom, John, St.");
    expect(result).toEqual(["St. John Chrysostom"]);
  });
});
