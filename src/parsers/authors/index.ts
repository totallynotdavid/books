import { splitAuthors } from "./strategies.ts";
import { applyTransforms, removeBrackets } from "./transforms.ts";
import { applyPublisherFallback } from "./special-cases.ts";

export function parseAuthors(
  authorText: string,
  publisherFallback?: string,
): string[] {
  if (!authorText.trim()) return [];

  const processed = splitAuthors(removeBrackets(authorText))
    .map((author) => applyTransforms(author))
    .filter((author) => author.length > 0);

  return applyPublisherFallback(processed, publisherFallback);
}
