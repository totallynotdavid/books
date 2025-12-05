import { load } from "cheerio";

const LIBGEN_BASE = "http://libgen.li";

export function parseLibgenMirrors(html: string): string[] {
  const $ = load(html);
  const mirrors: string[] = [];

  $('a:has(h2:contains("GET"))').each((_, element) => {
    const href = $(element).attr("href");
    if (href) {
      const fullUrl = href.startsWith("http") ? href : `${LIBGEN_BASE}${href}`;
      mirrors.push(fullUrl);
    }
  });

  return mirrors;
}

export function extractIpfsCidFromMetadata(data: unknown): string | null {
  if (typeof data !== "object" || data === null) {
    return null;
  }

  const record = data as Record<string, unknown>;

  if (Array.isArray(record["ipfs_cids"]) && record["ipfs_cids"].length > 0) {
    const cid = record["ipfs_cids"][0];
    return typeof cid === "string" ? cid : null;
  }

  if (typeof record["ipfs"] === "string") {
    return record["ipfs"];
  }

  return null;
}
