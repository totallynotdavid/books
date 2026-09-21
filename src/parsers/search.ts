import { load } from "cheerio";
import type { Cheerio } from "cheerio";
import type { Element } from "domhandler";
import type { Book } from "../types.ts";
import { parseAuthors } from "./authors/index.ts";

// Columns of #tablelibgen on libgen.li/index.php (files view).
const COL = {
  title: 0,
  authors: 1,
  publisher: 2,
  year: 3,
  language: 4,
  size: 6,
  extension: 7,
  mirrors: 8,
} as const;

export function parseSearchResults(html: string): Book[] {
  const $ = load(html);
  const books = new Map<string, Book>();

  $("#tablelibgen > tbody > tr").each((_, row) => {
    const book = parseRow($(row).children("td"));
    if (book && !books.has(book.id)) {
      books.set(book.id, book);
    }
  });

  return [...books.values()];
}

function parseRow($cells: Cheerio<Element>): Book | null {
  const cell = (index: number) => $cells.eq(index);
  const text = (index: number) => cleanText(cell(index).text());

  const id = extractMd5(cell(COL.mirrors));
  const title = extractTitle(cell(COL.title));

  if (!id || !title) {
    return null;
  }

  const book: Book = {
    id,
    title,
    authors: parseAuthors(text(COL.authors), text(COL.publisher)),
  };

  const fileType = text(COL.extension);
  const fileSize = text(COL.size);
  const year = extractYear(text(COL.year));
  const language = text(COL.language);

  if (fileType) book.fileType = fileType;
  if (fileSize) book.fileSize = fileSize;
  if (year !== undefined) book.year = year;
  if (language) book.language = language;

  return book;
}

function extractMd5($cell: Cheerio<Element>): string | null {
  const href = $cell.find("a[href*='ads.php']").attr("href") ?? "";
  const match = href.match(/md5=([a-f0-9]{32})/i);
  return match?.[1]?.toLowerCase() ?? null;
}

// The first edition link holds the title; its <i> children carry the
// edition or volume, which is not part of the title.
function extractTitle($cell: Cheerio<Element>): string | null {
  const $link = $cell.children("a[href^='edition.php']").first().clone();
  $link.find("i").remove();
  return cleanText($link.text()) || null;
}

function extractYear(text: string): number | undefined {
  const match = text.match(/\b\d{4}\b/);
  return match ? Number.parseInt(match[0], 10) : undefined;
}

function cleanText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
