import { isNameSuffix, isNameTitle } from "./transforms.ts";
import type { AuthorSplitStrategy } from "./types.ts";

const SemicolonStrategy: AuthorSplitStrategy = {
  detect: (text) => text.includes(";"),
  split: (text) => text.split(";").map((s) => s.trim()).filter(Boolean),
};

const PeriodDelimitedStrategy: AuthorSplitStrategy = {
  detect: (text) => {
    if (text.includes(" & ") || text.includes(" and ")) return false;
    const matches = text.match(/[a-zа-яёA-ZА-ЯЁ]{3,}\.\s*(?=[A-ZА-ЯЁ]|$)/g) || [];
    return matches.length >= 2;
  },
  split: (text) => {
    const parts = text.split(/(?<=[a-zа-яёA-ZА-ЯЁ]{3,})\.\s+/g);
    return parts.map((p) => p.trim()).filter(Boolean);
  },
};

const CommaAndStrategy: AuthorSplitStrategy = {
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

const AndStrategy: AuthorSplitStrategy = {
  detect: (text) => text.includes(" and ") || text.includes(" & "),
  split: (text) => {
    return text
      .split(/\s+(?:and|&)\s+/)
      .map((part) => part.trim())
      .filter(Boolean);
  },
};

const CommaStrategy: AuthorSplitStrategy = {
  detect: (text) => text.includes(","),
  split: (text) => {
    const parts = text.split(",").map((p) => p.trim());

    if (parts.length === 3) {
      const [lastName, firstName, third] = parts;
      if (!lastName || !firstName || !third) return parts;

      if (isNameSuffix(third) || isNameTitle(third)) return [text];

      return [`${firstName} ${lastName}`, third];
    }

    if (parts.length === 2) {
      const wordCounts = parts.map((p) => p.split(/\s+/).length);
      if ((wordCounts[0] ?? 0) <= 3 && (wordCounts[1] ?? 0) <= 2) {
        return [text];
      }
    }

    return parts;
  },
};

const STRATEGIES: AuthorSplitStrategy[] = [
  SemicolonStrategy,
  PeriodDelimitedStrategy,
  CommaAndStrategy,
  AndStrategy,
  CommaStrategy,
];

export function splitAuthors(text: string): string[] {
  const strategy = STRATEGIES.find((s) => s.detect(text));
  return strategy ? strategy.split(text) : [text];
}
