import { isNameSuffix, isNameTitle } from "./transforms.ts";
import type { AuthorSplitStrategy } from "./types.ts";

// Split by semicolons: "Maurya, Rahul; Maurya, Rahul"
export const SemicolonStrategy: AuthorSplitStrategy = {
  name: "semicolon",
  detect: (text) => text.includes(";"),
  split: (text) => text.split(";").map((s) => s.trim()).filter(Boolean),
};

// Split period-delimited Cyrillic names: "Role - Name. Role - Name."
// Requires 2+ occurrences to avoid splitting initials like "И. Б."
export const PeriodDelimitedStrategy: AuthorSplitStrategy = {
  name: "period-delimited",
  detect: (text) => {
    if (text.includes(" & ") || text.includes(" and ")) return false;
    const matches = text.match(/[a-zа-яёA-ZА-ЯЁ]{3,}\.\s*(?=[A-ZА-ЯЁ]|$)/g) || [];
    return matches.length >= 2;
  },
  split: (text) => {
    // Lookbehind ensures we only split after 3+ letter words
    const parts = text.split(/(?<=[a-zа-яёA-ZА-ЯЁ]{3,})\.\s+/g);
    return parts.map((p) => p.trim()).filter(Boolean);
  },
};

// Split by comma + and/&: "Ray Yao, Ada R. Swift, and Ruby C. Perl"
// Only matches when commas separate multiple authors, not "LastName, First and LastName, First"
export const CommaAndStrategy: AuthorSplitStrategy = {
  name: "comma-and",
  detect: (text) => text.includes(",") && (text.includes(", and ") || text.includes(", & ")),
  split: (text) => {
    return text
      .split(",")
      .flatMap((segment) => {
        if (segment.includes(" and ") || segment.includes(" & ")) {
          return segment.split(/\s+(?:and|&)\s+/);
        }
        return [segment];
      })
      .map((part) => part.trim())
      .filter(Boolean);
  },
};

// Split by and/&: "W. Richard Stevens & Stephen A. Rago"
export const AndStrategy: AuthorSplitStrategy = {
  name: "and",
  detect: (text) => text.includes(" and ") || text.includes(" & "),
  split: (text) => {
    return text
      .split(/\s+(?:and|&)\s+/)
      .map((part) => part.trim())
      .filter(Boolean);
  },
};

export const CommaStrategy: AuthorSplitStrategy = {
  name: "comma",
  detect: (text) => text.includes(","),
  split: (text) => {
    const parts = text.split(",").map((p) => p.trim());

    if (parts.length === 3) {
      const [lastName, firstName, third] = parts;
      if (!lastName || !firstName || !third) return parts;

      // Keep a recognized suffix or title with the person's name.
      if (isNameSuffix(third) || isNameTitle(third)) return [text];

      // Organization pattern: "LastName, FirstName, Organization"
      return [`${firstName} ${lastName}`, third];
    }

    // Don't split "LastName, FirstName" format
    if (parts.length === 2) {
      const wordCounts = parts.map((p) => p.split(/\s+/).length);
      if ((wordCounts[0] ?? 0) <= 3 && (wordCounts[1] ?? 0) <= 2) {
        return [text];
      }
    }

    return parts;
  },
};

export const SingleAuthorStrategy: AuthorSplitStrategy = {
  name: "single",
  detect: () => true,
  split: (text) => [text],
};

export const ALL_STRATEGIES: AuthorSplitStrategy[] = [
  SemicolonStrategy,
  PeriodDelimitedStrategy,
  CommaAndStrategy,
  AndStrategy,
  CommaStrategy,
  SingleAuthorStrategy,
];

export function selectStrategy(text: string): AuthorSplitStrategy {
  return ALL_STRATEGIES.find((s) => s.detect(text)) || SingleAuthorStrategy;
}
