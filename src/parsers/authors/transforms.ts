import type { AuthorTransform } from "./types.ts";

export const removeBrackets: AuthorTransform = (text) => {
  return text.replace(/\s*\[.*?\]\s*/g, "").trim();
};

export const removeParentheses: AuthorTransform = (text) => {
  return text.replace(/\s*\(.*?\)\s*/g, "").trim();
};

export const removePrefixes: AuthorTransform = (text) => {
  let cleaned = text;
  cleaned = cleaned.replace(/^(By|Illustrated\s+By)\s+/i, "");
  cleaned = cleaned.replace(/^(Составитель\s*-|Русский\sТекст\s*-|Иллюстрации\s*-)\s*/i, "");
  return cleaned.trim();
};

export const expandAbbreviations: AuthorTransform = (text) => {
  const abbreviations: Record<string, string> = {
    "coll.": "Collection",
    "coll": "Collection",
    "ed.": "Editor",
    "ed": "Editor",
    "eds.": "Editors",
    "eds": "Editors",
    "comp.": "Compiler",
    "comp": "Compiler",
    "trans.": "Translator",
    "trans": "Translator",
  };

  const lowerText = text.toLowerCase().trim();
  return abbreviations[lowerText] || text;
};

export const removeTrailingPeriod: AuthorTransform = (text) => {
  return text.replace(/([a-zа-яёA-ZА-ЯЁ]{3,})\.\s*$/i, "$1");
};

export const reverseLastNameFirst: AuthorTransform = (text) => {
  if (!text.includes(",")) return text;

  const parts = text.split(",");
  if (parts.length !== 2) return text;

  const [lastName, firstName] = parts;
  if (!lastName?.trim() || !firstName?.trim()) return text;

  return `${firstName.trim()} ${lastName.trim()}`;
};

export const capitalizeWords: AuthorTransform = (text) => {
  if (/^https?:\/\//i.test(text)) return text;

  return text
    .split(/\s+/)
    .map((word) => {
      if (!word || word.includes(".")) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
};

export const ALL_TRANSFORMS: AuthorTransform[] = [
  removeBrackets,
  removeParentheses,
  removePrefixes,
  expandAbbreviations,
  removeTrailingPeriod,
  reverseLastNameFirst,
  capitalizeWords,
];

export function applyTransforms(text: string, transforms: AuthorTransform[] = ALL_TRANSFORMS): string {
  return transforms.reduce((result, transform) => transform(result), text);
}
