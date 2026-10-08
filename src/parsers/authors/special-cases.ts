export function isBibliographicTerm(text: string): boolean {
  const terms = ["Collection", "Editor", "Editors", "Compiler", "Translator"];
  return terms.includes(text);
}

export function cleanPublisherText(text: string): string {
  return text.replace(/,?\s*\d{4}.*$/, "").trim();
}

// Replace bibliographic placeholders with the cleaned publisher.
export function applyPublisherFallback(authors: string[], publisherFallback?: string): string[] {
  const publisher = cleanPublisherText(publisherFallback ?? "");
  if (!publisher) return authors;

  return authors
    .map((author) => (isBibliographicTerm(author) ? publisher : author))
    .filter((author, index, all) => author !== publisher || all.indexOf(author) === index);
}
