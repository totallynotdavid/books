export function parseAuthors(authorText: string): string[] {
  if (!authorText.trim()) return [];

  const rawAuthors = splitIntoAuthors(authorText);
  return rawAuthors
    .map(cleanAuthor)
    .filter(isValid)
    .map(normalizeAuthor);
}

function splitIntoAuthors(text: string): string[] {
  if (text.includes(";")) {
    return text.split(";");
  }

  if (text.includes(" and ") || text.includes(" & ")) {
    return text.split(/\s+(?:and|&)\s+/);
  }

  if (shouldSplitByComma(text)) {
    return text.split(",");
  }

  return [text];
}

function shouldSplitByComma(text: string): boolean {
  if (!text.includes(",")) return false;

  const parts = text.split(",").map((p) => p.trim());

  if (parts.length === 2) {
    const wordCounts = parts.map((p) => p.split(/\s+/).length);
    if (wordCounts.every((count) => count <= 2)) {
      return false;
    }
  }

  return true;
}

function cleanAuthor(author: string): string {
  return author
    .replace(/\s*\(.*?\)\s*/g, "")
    .replace(/\s*\[.*?\]\s*/g, "")
    .trim();
}

function isValid(author: string): boolean {
  return author.length > 0;
}

function normalizeAuthor(author: string): string {
  if (isSingleWord(author)) {
    return author.trim();
  }

  if (isLastNameFirstFormat(author)) {
    return reverseToFirstNameLast(author);
  }

  return capitalizeWords(author);
}

function isSingleWord(text: string): boolean {
  return !text.trim().includes(" ");
}

function isLastNameFirstFormat(text: string): boolean {
  if (!text.includes(",")) return false;

  const parts = text.split(",");
  if (parts.length !== 2) return false;

  const [lastName, firstName] = parts;
  if (!lastName || !firstName) return false;

  return lastName.trim().length > 0 && firstName.trim().length > 0;
}

function reverseToFirstNameLast(text: string): string {
  const [lastName, firstName] = text.split(",").map((p) => p.trim());
  return capitalizeWords(`${firstName} ${lastName}`);
}

function capitalizeWords(text: string): string {
  return text
    .split(/\s+/)
    .map((word) => {
      if (!word) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}
