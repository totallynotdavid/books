import type { AuthorTransform } from "./types.ts";

export const removeBrackets: AuthorTransform = (text) => {
  return text.replace(/\s*\[.*?\]\s*/g, "").trim();
};

const removeParentheses: AuthorTransform = (text) => {
  return text.replace(/\s*\(.*?\)\s*/g, "").trim();
};

const removePrefixes: AuthorTransform = (text) => {
  let cleaned = text;
  cleaned = cleaned.replace(/^(By|Illustrated\s+By)\s+/i, "");
  cleaned = cleaned.replace(
    /^(Составитель\s*-|Русский\sТекст\s*-|Иллюстрации\s*-)\s*/i,
    "",
  );
  return cleaned.trim();
};

const ABBREVIATIONS = new Map([
  ["coll.", "Collection"],
  ["coll", "Collection"],
  ["ed.", "Editor"],
  ["ed", "Editor"],
  ["eds.", "Editors"],
  ["eds", "Editors"],
  ["comp.", "Compiler"],
  ["comp", "Compiler"],
  ["trans.", "Translator"],
  ["trans", "Translator"],
]);

export const BIBLIOGRAPHIC_TERMS = new Set(ABBREVIATIONS.values());

const expandAbbreviations: AuthorTransform = (text) => {
  const lowerText = text.toLowerCase().trim();
  return ABBREVIATIONS.get(lowerText) ?? text;
};

const removeTrailingPeriod: AuthorTransform = (text) => {
  return text.replace(/([a-zа-яёA-ZА-ЯЁ]{3,})\.\s*$/i, "$1");
};

const NAME_SUFFIX = /^(?:jr|sr|ii|iii|iv|esq|phd|md)\.?$/i;
const NAME_TITLE = /^(?:st|dr|prof|sir|rev|fr)\.?$/i;

export function isNameSuffix(text: string): boolean {
  return NAME_SUFFIX.test(text);
}

export function isNameTitle(text: string): boolean {
  return NAME_TITLE.test(text);
}

const reverseLastNameFirst: AuthorTransform = (text) => {
  if (!text.includes(",")) return text;

  const parts = text.split(",").map((part) => part.trim());
  if (parts.some((part) => !part)) return text;

  if (parts.length === 2) {
    return `${parts[1]} ${parts[0]}`;
  }

  if (parts.length === 3) {
    const [lastName, firstName, third = ""] = parts;
    if (isNameSuffix(third)) return `${firstName} ${lastName} ${third}`;
    if (isNameTitle(third)) return `${third} ${firstName} ${lastName}`;
  }

  return text;
};

const capitalizeWords: AuthorTransform = (text) => {
  if (/^https?:\/\//i.test(text)) return text;

  const words = text.split(/\s+/);
  return words
    .map((word, index) => {
      if (
        index > 0 &&
        index === words.length - 1 &&
        /^(?:ii|iii|iv)$/i.test(word)
      ) {
        return word.toUpperCase();
      }
      if (!word || word.includes(".")) return word;
      // Mixed case is deliberate (McNelly, DeVito); only normalize words
      // written in a single case.
      if (word !== word.toLowerCase() && word !== word.toUpperCase()) {
        return word;
      }
      return word
        .toLowerCase()
        .replace(/(^|['-])(.)/g, (_, p, c) => p + c.toUpperCase());
    })
    .join(" ");
};

const TRANSFORMS: AuthorTransform[] = [
  removeBrackets,
  removeParentheses,
  removePrefixes,
  expandAbbreviations,
  removeTrailingPeriod,
  reverseLastNameFirst,
  capitalizeWords,
];

export function applyTransforms(text: string): string {
  return TRANSFORMS.reduce((result, transform) => transform(result), text);
}
