import type { DownloadUrls } from "./types.ts";
import { ANNAS_ARCHIVE_BASE, LIBGEN_BASE, IPFS_GATEWAY, USER_AGENT } from "./constants.ts";
import { createNetworkError } from "./errors.ts";
import { parseLibgenMirrors } from "./parsers/download-page.ts";

export async function getDownloadUrls(bookId: string): Promise<DownloadUrls> {
  if (!bookId?.trim()) {
    throw new TypeError("Book ID cannot be empty");
  }

  const urls: DownloadUrls = {
    mirrors: [],
  };

  try {
    const metadataUrl = `${ANNAS_ARCHIVE_BASE}/dyn/small_file/md5/${bookId}`;
    const metadata = await fetchJson(metadataUrl);
    const ipfsCid = extractIpfsCid(metadata);

    if (ipfsCid) {
      urls.ipfs = `${IPFS_GATEWAY}/${ipfsCid}`;
    }
  } catch (_err) {
    // Continue if not found
  }

  const libgenUrl = `${LIBGEN_BASE}/library.php?md5=${bookId}`;
  const libgenHtml = await fetchHtml(libgenUrl);
  const mirrors = parseLibgenMirrors(libgenHtml);

  urls.mirrors = mirrors.map((path) => `${LIBGEN_BASE}/${path}`);

  return urls;
}

function extractIpfsCid(data: Record<string, unknown>): string | null {
  if (Array.isArray(data["ipfs_cids"]) && data["ipfs_cids"].length > 0) {
    const cid = data["ipfs_cids"][0];
    return typeof cid === "string" ? cid : null;
  }

  if (typeof data["ipfs"] === "string") {
    return data["ipfs"];
  }

  return null;
}

async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!response.ok) {
    throw createNetworkError(response.status, url);
  }

  return response.text();
}

async function fetchJson(url: string): Promise<Record<string, unknown>> {
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!response.ok) {
    throw createNetworkError(response.status, url);
  }

  return response.json() as Promise<Record<string, unknown>>;
}
