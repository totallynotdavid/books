import { fetchHtml } from "./http.ts";
import { parseSearchResults } from "./parsers/search.ts";
import type { Book } from "./types.ts";

const ANNAS_ARCHIVE_BASE = "https://annas-archive.li";

export async function searchBooks(query: string): Promise<Book[]> {
  if (!query?.trim()) {
    throw new TypeError("Query cannot be empty");
  }

  const url = `${ANNAS_ARCHIVE_BASE}/search?q=${encodeURIComponent(query)}`;
  const html = await fetchHtml(url);

  return parseSearchResults(html);
}
