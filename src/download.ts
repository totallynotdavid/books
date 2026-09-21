import { fetchHtml, LIBGEN_BASE } from "./http.ts";
import { parseGetPhpUrl, parseIpfsUrl } from "./parsers/download.ts";
import type { DownloadUrls } from "./types.ts";

export async function getDownloadUrls(bookId: string): Promise<DownloadUrls> {
  if (!bookId?.trim()) {
    throw new TypeError("Book ID cannot be empty");
  }

  const md5 = encodeURIComponent(bookId.trim());
  const fileUrl = `${LIBGEN_BASE}/file.php?md5=${md5}`;
  // The get.php key on this page expires, so it is fetched on every call.
  const adsUrl = `${LIBGEN_BASE}/ads.php?md5=${md5}`;

  const [fileHtml, adsHtml] = await Promise.all([
    fetchHtml(fileUrl),
    fetchHtml(adsUrl),
  ]);

  const result: DownloadUrls = { libgenMirrors: [] };

  const ipfsUrl = parseIpfsUrl(fileHtml);
  if (ipfsUrl) {
    result.ipfs = ipfsUrl;
  }

  const getPhpUrl = parseGetPhpUrl(adsHtml, adsUrl);
  if (getPhpUrl) {
    result.libgenMirrors.push(getPhpUrl);
  }

  return result;
}
