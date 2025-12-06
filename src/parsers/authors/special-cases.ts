export function isBibliographicTerm(text: string): boolean {
  const terms = ["Collection", "Editor", "Editors", "Compiler", "Translator"];
  return terms.includes(text);
}

export function cleanPublisherText(text: string): string {
  return text.replace(/,?\s*\d{4}.*$/, "").trim();
}

// Replace bibliographic placeholder (e.g. "Collection") with publisher if available
export function applyPublisherFallback(authors: string[], publisherFallback?: string): string[] {
  if (authors.length === 0) return authors;
  if (!publisherFallback?.trim()) return authors;

  if (isBibliographicTerm(authors[0]!)) {
    const cleanPublisher = cleanPublisherText(publisherFallback);
    return cleanPublisher ? [cleanPublisher] : authors;
  }

  return authors;
}
