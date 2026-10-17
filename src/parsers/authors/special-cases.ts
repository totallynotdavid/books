import { BIBLIOGRAPHIC_TERMS } from "./transforms.ts";

function cleanPublisherText(text: string): string {
  return text.replace(/,?\s*\d{4}.*$/, "").trim();
}

export function applyPublisherFallback(
  authors: string[],
  publisherFallback?: string,
): string[] {
  const publisher = cleanPublisherText(publisherFallback ?? "");
  if (!publisher) return authors;

  return authors
    .map((author) => (BIBLIOGRAPHIC_TERMS.has(author) ? publisher : author))
    .filter(
      (author, index, all) =>
        author !== publisher || all.indexOf(author) === index,
    );
}
