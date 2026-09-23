import { LibraryFetchError } from "./errors.ts";

export const LIBGEN_BASE = "https://libgen.li";

const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const TIMEOUT_MS = 30_000;

export async function fetchHtml(url: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new LibraryFetchError(`HTTP ${response.status}`, response.status);
    }

    return await response.text();
  } catch (err) {
    if (err instanceof LibraryFetchError) {
      throw err;
    }

    throw new LibraryFetchError(
      err instanceof Error ? err.message : "Network request failed",
      0,
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
