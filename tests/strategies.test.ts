import { describe, expect, it } from "bun:test";
import {
  SemicolonStrategy,
  PeriodDelimitedStrategy,
  CommaAndStrategy,
  AndStrategy,
  CommaStrategy,
  SingleAuthorStrategy,
  selectStrategy,
} from "../src/parsers/authors/strategies.ts";

describe("SemicolonStrategy", () => {
  it("detects semicolons", () => {
    expect(SemicolonStrategy.detect("A; B")).toBe(true);
    expect(SemicolonStrategy.detect("A, B")).toBe(false);
  });

  it("splits by semicolons", () => {
    expect(SemicolonStrategy.split("Maurya, Rahul; Maurya, Rahul")).toEqual(["Maurya, Rahul", "Maurya, Rahul"]);
  });
});

describe("PeriodDelimitedStrategy", () => {
  it("detects period-delimited format", () => {
    expect(PeriodDelimitedStrategy.detect("Role - Name. Role - Name.")).toBe(true);
    expect(PeriodDelimitedStrategy.detect("Name. Initial A.")).toBe(false);
  });

  it("does not detect when 'and' or '&' present", () => {
    expect(PeriodDelimitedStrategy.detect("Name. Name. and Other")).toBe(false);
  });

  it("splits by periods after 3+ letter words", () => {
    const input = "Составитель - Sheila Pemberton. Русский Текст - И. Б. Соболева. Иллюстрации - Val Biro.";
    const result = PeriodDelimitedStrategy.split(input);

    expect(result).toEqual(["Составитель - Sheila Pemberton", "Русский Текст - И. Б. Соболева", "Иллюстрации - Val Biro."]);
  });
});

describe("CommaAndStrategy", () => {
  it("detects comma with and/&", () => {
    expect(CommaAndStrategy.detect("A, B, and C")).toBe(true);
    expect(CommaAndStrategy.detect("A, B, & C")).toBe(true);
    expect(CommaAndStrategy.detect("A, B")).toBe(false);
  });

  it("splits by comma and and/&", () => {
    const result = CommaAndStrategy.split("Ray Yao, Ada R. Swift, and Ruby C. Perl");
    expect(result).toEqual(["Ray Yao", "Ada R. Swift", "Ruby C. Perl"]);
  });
});

describe("AndStrategy", () => {
  it("detects and/&", () => {
    expect(AndStrategy.detect("A & B")).toBe(true);
    expect(AndStrategy.detect("A and B")).toBe(true);
    expect(AndStrategy.detect("A, B")).toBe(false);
  });

  it("splits by and/&", () => {
    expect(AndStrategy.split("W. Richard Stevens & Stephen A. Rago")).toEqual(["W. Richard Stevens", "Stephen A. Rago"]);
  });
});

describe("CommaStrategy", () => {
  it("detects commas", () => {
    expect(CommaStrategy.detect("A, B")).toBe(true);
    expect(CommaStrategy.detect("A B")).toBe(false);
  });

  it("keeps 'LastName, FirstName' together", () => {
    expect(CommaStrategy.split("Sullivan, William")).toEqual(["Sullivan, William"]);
  });

  it("handles 3-part tuple with honorific", () => {
    expect(CommaStrategy.split("Chrysostom, John, St.")).toEqual(["St. John Chrysostom"]);
  });

  it("handles 3-part tuple with organization", () => {
    expect(CommaStrategy.split("Mighton, John, Jump Math")).toEqual(["John Mighton", "Jump Math"]);
  });

  it("splits when parts have 3+ words", () => {
    const result = CommaStrategy.split("Long Author Name, Another Long Name");
    expect(result).toEqual(["Long Author Name", "Another Long Name"]);
  });
});

describe("selectStrategy", () => {
  it("selects SemicolonStrategy first", () => {
    expect(selectStrategy("A; B")).toBe(SemicolonStrategy);
  });

  it("selects PeriodDelimitedStrategy before CommaStrategy", () => {
    const input = "Name. Name.";
    expect(selectStrategy(input)).toBe(PeriodDelimitedStrategy);
  });

  it("selects CommaAndStrategy before AndStrategy", () => {
    expect(selectStrategy("A, B, and C")).toBe(CommaAndStrategy);
  });

  it("selects AndStrategy before CommaStrategy", () => {
    expect(selectStrategy("A & B")).toBe(AndStrategy);
  });

  it("falls back to SingleAuthorStrategy", () => {
    expect(selectStrategy("Single Name")).toBe(SingleAuthorStrategy);
  });
});
