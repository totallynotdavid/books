import { load } from "cheerio";
import type { CheerioAPI, Cheerio } from "cheerio";
import type { Element } from "domhandler";
import type { Book } from "../types.ts";
import { parseAuthors } from "./authors.ts";

export function parseSearchResults(html: string): Book[] {
  const $ = load(html);
  const books: Book[] = [];

  $(".js-aarecord-list-outer .flex.pt-3").each((_, element) => {
    const book = parseBookElement($, $(element));
    if (book) {
      books.push(book);
    }
  });

  return books;
}

function parseBookElement(
  _$: CheerioAPI,
  $element: Cheerio<Element>,
): Book | null {
  const id = extractBookId($element);
  const title = extractTitle($element);

  if (!id || !title) {
    return null;
  }

  const authorText = extractAuthorText($element);
  const authors = parseAuthors(authorText);
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

function extractBookId($element: Cheerio<Element>): string | null {
  const href = $element.find("a[href*='/md5/']").first().attr("href");
  if (!href) {
    return null;
  }

  const parts = href.split("/");
  const id = parts[parts.length - 1];
  return id || null;
}

function extractTitle($element: Cheerio<Element>): string | null {
  const title = $element.find("a").eq(1).text().trim();
  return title || null;
}

function extractAuthorText($element: Cheerio<Element>): string {
  return $element
    .find("a[href*='/search?q=']")
    .first()
    .text()
    .trim();
}

function extractMetadata($element: Cheerio<Element>) {
  const metadataText = $element.find(".text-gray-800").text();
  const parts = metadataText.split(" · ").map((part) => part.trim());

  const rawFileType = parts[1] || "";
  const fileType = rawFileType.replace(/\s*\[.*?\]\s*/g, "").trim();

  const fileSize = parts[2] || "";

  const languageCode = extractLanguageCode(parts[0]);

  let year: number | undefined;
  for (const part of parts) {
    year = extractYear(part);
    if (year !== undefined) {
      break;
    }
  }

  return {
    fileType: fileType || undefined,
    fileSize: fileSize || undefined,
    language: languageCode,
    year,
  };
}

function extractLanguageCode(text: string | undefined): string | undefined {
  if (!text) {
    return undefined;
  }

  const match = text.match(/\[([a-z]{2,3})\]/i);
  return match?.[1]?.toLowerCase();
}

function extractYear(text: string | undefined): number | undefined {
  if (!text) {
    return undefined;
  }

  const match = text.match(/\b(19|20)\d{2}\b/);
  return match ? parseInt(match[0], 10) : undefined;
}
