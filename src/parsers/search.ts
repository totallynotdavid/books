import { load } from "cheerio";
import type { CheerioAPI, Cheerio } from "cheerio";
import type { Element } from "domhandler";
import type { Book } from "../types.ts";
import { parseAuthors } from "./authors/index.ts";

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
  const publisherText = extractPublisherText($element);
  const authors = parseAuthors(authorText, publisherText);
  const metadata = extractMetadata($element);
  const thumbnail = $element.find("img").attr("src");

  const book: Book = {
    id,
    title,
    authors,
  };

  if (metadata.fileType !== undefined) book.fileType = metadata.fileType;
  if (metadata.fileSize !== undefined) book.fileSize = metadata.fileSize;
  if (metadata.year !== undefined) book.year = metadata.year;
  if (metadata.language !== undefined) book.language = metadata.language;
  if (thumbnail) book.thumbnail = thumbnail;

  return book;
}

function extractBookId($element: Cheerio<Element>): string | null {
  const href = $element.find("a[href*='/md5/']").first().attr("href");
  if (!href) return null;

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

function extractPublisherText($element: Cheerio<Element>): string {
  const links = $element.find("a[href*='/search?q=']");
  if (links.length < 2) return "";

  const publisherLink = links.eq(1);
  if (publisherLink.find("span[class*='company']").length > 0) {
    return publisherLink.text().trim();
  }

  return "";
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
    if (year !== undefined) break;
  }

  return {
    fileType: fileType || undefined,
    fileSize: fileSize || undefined,
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
