import { describe, expect, it } from "bun:test";
import { parseAuthors } from "../src/parsers/authors/index.ts";

describe("parseAuthors - basic cases", () => {
  it("handles empty input", () => {
    expect(parseAuthors("")).toEqual([]);
    expect(parseAuthors("  ")).toEqual([]);
  });

  it("handles single author", () => {
    expect(parseAuthors("Rob Isenberg")).toEqual(["Rob Isenberg"]);
  });

  it("handles lowercase names", () => {
    expect(parseAuthors("hu, yang")).toEqual(["Yang Hu"]);
  });

  it("preserves URLs as authors", () => {
    expect(parseAuthors("https://www.tutorialspoint.com/")).toEqual([
      "https://www.tutorialspoint.com/",
    ]);
  });
});

describe("parseAuthors - name formats", () => {
  it("reverses LastName, FirstName format", () => {
    expect(parseAuthors("Sullivan, William")).toEqual(["William Sullivan"]);
    expect(parseAuthors("Smith, John")).toEqual(["John Smith"]);
  });

  it("handles initials", () => {
    expect(parseAuthors("Martin J.")).toEqual(["Martin J."]);
    expect(parseAuthors("J.K. Rowling")).toEqual(["J.K. Rowling"]);
  });

  it("handles names with periods (non-initials)", () => {
    expect(parseAuthors("Dr. Smith")).toEqual(["Dr. Smith"]);
  });

  it("removes trailing periods from full words", () => {
    expect(parseAuthors("Val Biro.")).toEqual(["Val Biro"]);
  });
});

describe("parseAuthors - multiple authors", () => {
  it("splits by semicolon", () => {
    expect(parseAuthors("Maurya, Rahul; Maurya, Rahul")).toEqual([
      "Rahul Maurya",
      "Rahul Maurya",
    ]);
  });

  it("splits by 'and'", () => {
    expect(parseAuthors("John Doe and Jane Smith")).toEqual([
      "John Doe",
      "Jane Smith",
    ]);
  });

  it("splits by '&'", () => {
    expect(parseAuthors("W. Richard Stevens & Stephen A. Rago")).toEqual([
      "W. Richard Stevens",
      "Stephen A. Rago",
    ]);
  });

  it("splits by comma + and", () => {
    expect(parseAuthors("Ray Yao, Ada R. Swift, and Ruby C. Perl")).toEqual([
      "Ray Yao",
      "Ada R. Swift",
      "Ruby C. Perl",
    ]);
  });

  it("splits comma-separated without 'and'", () => {
    expect(parseAuthors("Mighton, John, Jump Math")).toEqual([
      "John Mighton",
      "Jump Math",
    ]);
  });

  it("handles Cyrillic period-delimited format", () => {
    const input =
      "Составитель - Sheila Pemberton. Русский Текст - И. Б. Соболева. Иллюстрации - Val Biro.";
    expect(parseAuthors(input)).toEqual([
      "Sheila Pemberton",
      "И. Б. Соболева",
      "Val Biro",
    ]);
  });
});

describe("parseAuthors - special notations", () => {
  it("removes brackets", () => {
    expect(parseAuthors("Casey, Elle [Casey, Elle]")).toEqual(["Elle Casey"]);
  });

  it("removes parentheses", () => {
    expect(
      parseAuthors("Jaime González García, Artur Mizera (editor)"),
    ).toEqual(["Jaime González García", "Artur Mizera"]);
  });

  it("removes 'By' prefix", () => {
    expect(
      parseAuthors("By Winston Churchill, Illustrated by J.H. Gardner Soper"),
    ).toEqual(["Winston Churchill", "J.H. Gardner Soper"]);
  });

  it("removes Russian role prefixes", () => {
    expect(parseAuthors("Составитель - Sheila Pemberton")).toEqual([
      "Sheila Pemberton",
    ]);
    expect(parseAuthors("Русский Текст - И. Б. Соболева")).toEqual([
      "И. Б. Соболева",
    ]);
    expect(parseAuthors("Иллюстрации - Val Biro")).toEqual(["Val Biro"]);
  });
});

describe("parseAuthors - bibliographic terms", () => {
  it("expands 'coll.' to 'Collection'", () => {
    expect(parseAuthors("coll.")).toEqual(["Collection"]);
    expect(parseAuthors("coll")).toEqual(["Collection"]);
  });

  it("expands 'ed.' to 'Editor'", () => {
    expect(parseAuthors("ed.")).toEqual(["Editor"]);
    expect(parseAuthors("eds.")).toEqual(["Editors"]);
  });

  it("expands other abbreviations", () => {
    expect(parseAuthors("comp.")).toEqual(["Compiler"]);
    expect(parseAuthors("trans.")).toEqual(["Translator"]);
  });

  it("replaces bibliographic term with publisher fallback", () => {
    expect(parseAuthors("coll.", "SitePoint, 2018")).toEqual(["SitePoint"]);
    expect(parseAuthors("Collection", "O'Reilly Media")).toEqual([
      "O'Reilly Media",
    ]);
  });

  it("keeps normal authors when publisher fallback provided", () => {
    expect(parseAuthors("John Doe", "SitePoint, 2018")).toEqual(["John Doe"]);
  });
});

describe("parseAuthors - honorifics and titles", () => {
  it("handles 3-part tuple with honorific", () => {
    expect(parseAuthors("Chrysostom, John, St.")).toEqual([
      "St. John Chrysostom",
    ]);
    expect(parseAuthors("King, Martin, Jr.")).toEqual(["Jr. Martin King"]);
  });

  it("handles 3-part tuple with organization", () => {
    expect(parseAuthors("Mighton, John, Jump Math")).toEqual([
      "John Mighton",
      "Jump Math",
    ]);
  });
});

describe("parseAuthors - edge cases", () => {
  it("handles mixed Cyrillic and Latin", () => {
    expect(parseAuthors("Иванов, Петр and Smith, John")).toEqual([
      "Петр Иванов",
      "John Smith",
    ]);
  });

  it("preserves spacing in multi-word names", () => {
    expect(parseAuthors("Van Der Berg, Hans")).toEqual(["Hans Van Der Berg"]);
  });

  it("handles names with apostrophes", () => {
    expect(parseAuthors("O'Brien, Patrick")).toEqual(["Patrick O'Brien"]);
  });

  it("handles hyphenated names", () => {
    expect(parseAuthors("Smith-Jones, Mary")).toEqual(["Mary Smith-Jones"]);
  });

  it("handles accented characters", () => {
    expect(parseAuthors("García, José")).toEqual(["José García"]);
    expect(parseAuthors("Müller, Franz")).toEqual(["Franz Müller"]);
  });
});

describe("parseAuthors - capitalization", () => {
  it("keeps deliberate mixed case", () => {
    expect(parseAuthors("Willis E. McNelly")).toEqual(["Willis E. McNelly"]);
    expect(parseAuthors("DeVito, Danny")).toEqual(["Danny DeVito"]);
  });

  it("normalizes single-case words", () => {
    expect(parseAuthors("SMITH, JOHN")).toEqual(["John Smith"]);
  });
});
