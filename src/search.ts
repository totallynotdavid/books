import { fetchHtml, LIBGEN_BASE } from "./http.ts";
import { parseSearchResults } from "./parsers/search.ts";
import type { Book } from "./types.ts";

export async function searchBooks(query: string): Promise<Book[]> {
  if (!query?.trim()) {
    throw new TypeError("Query cannot be empty");
  }

  // Title column, files view, LibGen (non-fiction/fiction) topic, 25 per page.
  const params = new URLSearchParams({
    req: query,
    "columns[]": "t",
    "objects[]": "f",
    "topics[]": "l",
    res: "25",
  });
  const html = await fetchHtml(`${LIBGEN_BASE}/index.php?${params}`);

  return parseSearchResults(html);
}
