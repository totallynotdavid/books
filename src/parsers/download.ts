import { load } from "cheerio";

export function parseIpfsUrl(html: string): string | null {
  const $ = load(html);
  const ipfsLink = $('a[title="IPFS.io"]').attr("href");
  return ipfsLink || null;
}

/** Resolves the get.php link on an ads.php page against that page's URL. */
export function parseGetPhpUrl(html: string, pageUrl: string): string | null {
  const $ = load(html);
  const getLink = $('a[href*="get.php"]').attr("href");
  if (!getLink) return null;
  return new URL(getLink, pageUrl).href;
}
