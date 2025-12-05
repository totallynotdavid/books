import { describe, expect, it } from "bun:test";
import {
  removeBrackets,
  removeParentheses,
  removePrefixes,
  expandAbbreviations,
  removeTrailingPeriod,
  reverseLastNameFirst,
  capitalizeWords,
  applyTransforms,
} from "../src/parsers/authors/transforms.ts";

describe("removeBrackets", () => {
  it("removes brackets", () => {
    expect(removeBrackets("Casey, Elle [Casey, Elle]")).toBe("Casey, Elle");
  });
});

describe("removeParentheses", () => {
  it("removes parentheses", () => {
    expect(removeParentheses("Artur Mizera (editor)")).toBe("Artur Mizera");
  });
});

describe("removePrefixes", () => {
  it("removes 'By' prefix", () => {
    expect(removePrefixes("By Winston Churchill")).toBe("Winston Churchill");
  });

  it("removes 'Illustrated By' prefix", () => {
    expect(removePrefixes("Illustrated By J.H. Gardner Soper")).toBe("J.H. Gardner Soper");
  });

  it("removes Russian prefixes", () => {
    expect(removePrefixes("Составитель - Sheila")).toBe("Sheila");
    expect(removePrefixes("Русский Текст - И. Б.")).toBe("И. Б.");
    expect(removePrefixes("Иллюстрации - Val")).toBe("Val");
  });
});

describe("expandAbbreviations", () => {
  it("expands 'coll.' to 'Collection'", () => {
    expect(expandAbbreviations("coll.")).toBe("Collection");
    expect(expandAbbreviations("coll")).toBe("Collection");
  });

  it("expands 'ed.' to 'Editor'", () => {
    expect(expandAbbreviations("ed.")).toBe("Editor");
    expect(expandAbbreviations("eds.")).toBe("Editors");
  });

  it("leaves non-abbreviations unchanged", () => {
    expect(expandAbbreviations("John Doe")).toBe("John Doe");
  });
});

describe("removeTrailingPeriod", () => {
  it("removes period from 3+ letter words", () => {
    expect(removeTrailingPeriod("Val Biro.")).toBe("Val Biro");
  });

  it("preserves initials", () => {
    expect(removeTrailingPeriod("Martin J.")).toBe("Martin J.");
  });
});

describe("reverseLastNameFirst", () => {
  it("reverses 'LastName, FirstName' format", () => {
    expect(reverseLastNameFirst("Sullivan, William")).toBe("William Sullivan");
  });

  it("leaves non-comma text unchanged", () => {
    expect(reverseLastNameFirst("John Doe")).toBe("John Doe");
  });

  it("leaves 3+ part comma text unchanged", () => {
    expect(reverseLastNameFirst("A, B, C")).toBe("A, B, C");
  });
});

describe("capitalizeWords", () => {
  it("capitalizes words", () => {
    expect(capitalizeWords("john doe")).toBe("John Doe");
  });

  it("preserves initials with periods", () => {
    expect(capitalizeWords("martin J.")).toBe("Martin J.");
    expect(capitalizeWords("J.H. gardner")).toBe("J.H. Gardner");
  });

  it("preserves URLs", () => {
    expect(capitalizeWords("https://www.example.com/")).toBe("https://www.example.com/");
  });

  it("handles mixed case", () => {
    expect(capitalizeWords("hu, yang")).toBe("Hu, Yang");
  });
});

describe("applyTransforms", () => {
  it("applies all transforms in order", () => {
    const input = "By Sullivan, William (author)";
    const result = applyTransforms(input);
    expect(result).toBe("William Sullivan");
  });

  it("handles Cyrillic with initials", () => {
    const input = "Русский Текст - И. Б. Соболева.";
    const result = applyTransforms(input);
    expect(result).toBe("И. Б. Соболева");
  });
});
