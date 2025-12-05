import { load } from "cheerio";
import type { Cheerio, CheerioAPI } from "cheerio";
import type { Element } from "domhandler";
import { type } from "arktype";
import { BookSchema } from "../types.ts";
import type { Book } from "../types.ts";
import { createParseError } from "../errors.ts";

export function parseSearchResults(html: string, limit?: number): Book[] {
  const $ = load(html);
  const books: Book[] = [];

  const bookElements = $(".js-aarecord-list-outer .flex.pt-3");

  bookElements.each((_, element) => {
    try {
      const book = parseBookElement($, $(element));

      if (book) {
        // Validate with ArkType
        const validated = BookSchema(book);

        if (!(validated instanceof type.errors)) {
          books.push(validated);
        }
      }
    } catch {
      // Skip malformed entries silently
    }
  });

  if (books.length === 0 && bookElements.length > 0) {
    throw createParseError("Could not parse any books from search results");
  }

  return limit ? books.slice(0, limit) : books;
}

function parseBookElement(_$: CheerioAPI, $element: Cheerio<Element>): Partial<Book> | null {
  const id = extractId($element);
  if (!id) return null;

  const title = extractTitle($element);
  if (!title) return null;

  const authors = extractAuthors($element);
  const metadata = extractMetadata($element);
  const thumbnail = $element.find("img").attr("src");

  return {
    id,
    title,
    authors,
    fileType: metadata.fileType,
    fileSize: metadata.fileSize,
    year: metadata.year,
    language: metadata.language,
    thumbnail: thumbnail || undefined,
  };
}

function extractId($element: Cheerio<Element>): string | null {
  const href = $element.find("a[href*='/md5/']").first().attr("href");
  if (!href) return null;

  const parts = href.split("/");
  return parts[parts.length - 1] || null;
}

function extractTitle($element: Cheerio<Element>): string | null {
  const title = $element.find("a").eq(1).text().trim();
  return title || null;
}

function extractAuthors($element: Cheerio<Element>): string[] {
  const authorText = $element
    .find("a[href*='/search?q=']")
    .first()
    .text()
    .trim();

  if (!authorText) return [];

  return authorText
    .split(/[;,]/)
    .map((author: string) => author.trim())
    .filter((author: string) => author.length > 0);
}

function extractMetadata($element: Cheerio<Element>) {
  const metadataText = $element.find(".text-gray-800").text();
  const parts = metadataText.split(" · ").map((part: string) => part.trim());

  const rawFileType = parts[1] || "";
  const fileType = rawFileType.replace(/\s*\[.*?\]\s*/g, "").trim();

  const fileSize = parts[2] || "";

  const languageCode = extractLanguageCode(parts[0]);
  const year = extractYear(parts[3]);

  return {
    fileType,
    fileSize,
    language: languageCode,
    year,
  };
}

function extractLanguageCode(text: string | undefined): string | undefined {
  if (!text) return undefined;

  const match = text.match(/\[([a-z]{2,3})\]/i);
  return match?.[1]?.toLowerCase();
}

function extractYear(text: string | undefined): number | undefined {
  if (!text) return undefined;

  const match = text.match(/\b(19|20)\d{2}\b/);
  return match ? parseInt(match[0], 10) : undefined;
}
