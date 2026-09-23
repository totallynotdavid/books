import { afterEach, beforeEach, describe, expect, it, spyOn } from "bun:test";
import type { Mock } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { LibraryFetchError, getDownloadUrls, searchBooks } from "../src/index.ts";

const fixture = (name: string) =>
  readFileSync(join(import.meta.dir, "fixtures", name), "utf8");

const pages: Record<string, string> = {
  "/index.php": fixture("libgen-search.html"),
  "/file.php": fixture("libgen-file.html"),
  "/ads.php": fixture("libgen-ads.html"),
};

let fetchMock: Mock<typeof fetch>;
let respond: (url: URL) => Response;

const requestedUrls = () =>
  fetchMock.mock.calls.map(([input]) => new URL(String(input)));

beforeEach(() => {
  respond = (url) => {
    const page = pages[url.pathname];
    return page === undefined
      ? new Response("not found", { status: 404 })
      : new Response(page, { status: 200 });
  };
  fetchMock = spyOn(globalThis, "fetch").mockImplementation((async (
    input: string | URL | Request,
  ) => respond(new URL(String(input)))) as typeof fetch);
});

afterEach(() => {
  fetchMock.mockRestore();
});

describe("searchBooks", () => {
  it("queries libgen.li by title and parses the results", async () => {
    const books = await searchBooks("dune messiah");

    const [url] = requestedUrls();
    expect(url?.origin).toBe("https://libgen.li");
    expect(url?.pathname).toBe("/index.php");
    expect(url?.searchParams.get("req")).toBe("dune messiah");
    expect(url?.searchParams.get("columns[]")).toBe("t");
    expect(url?.searchParams.get("objects[]")).toBe("f");
    expect(url?.searchParams.get("topics[]")).toBe("l");
    expect(url?.searchParams.get("res")).toBe("25");

    expect(books).toHaveLength(25);
    expect(books[0]).toMatchObject({
      id: "5ac0ff98513e82598e5396cc78732a4c",
      title: "The Dune Encyclopedia",
    });
  });

  it("makes no request outside libgen.li", async () => {
    await searchBooks("dune");
    await getDownloadUrls("840e6f0826109b93b4355dadd04240ee");

    for (const url of requestedUrls()) {
      expect(url.hostname).toBe("libgen.li");
    }
  });

  it("throws TypeError on an empty query", async () => {
    await expect(searchBooks("")).rejects.toThrow(TypeError);
    await expect(searchBooks("  ")).rejects.toThrow(TypeError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("throws LibraryFetchError with the HTTP status", async () => {
    respond = () => new Response("unavailable", { status: 503 });

    const error = await searchBooks("dune").catch((err: unknown) => err);
    expect(error).toBeInstanceOf(LibraryFetchError);
    expect((error as LibraryFetchError).statusCode).toBe(503);
  });

  it("throws LibraryFetchError with status 0 on network failure", async () => {
    respond = () => {
      throw new TypeError("fetch failed");
    };

    const error = await searchBooks("dune").catch((err: unknown) => err);
    expect(error).toBeInstanceOf(LibraryFetchError);
    expect((error as LibraryFetchError).statusCode).toBe(0);
    expect((error as LibraryFetchError).message).toBe("fetch failed");
  });
});

describe("getDownloadUrls", () => {
  const md5 = "840e6f0826109b93b4355dadd04240ee";

  it("returns the IPFS link and the keyed get.php link", async () => {
    const urls = await getDownloadUrls(md5);

    expect(urls.ipfs).toStartWith("https://gateway.ipfs.io/ipfs/");
    expect(urls.libgenMirrors).toEqual([
      `https://libgen.li/get.php?md5=${md5}&key=LI8TUYAH2UR418AT`,
    ]);
    expect(requestedUrls().map((url) => url.href)).toContain(
      `https://libgen.li/ads.php?md5=${md5}`,
    );
  });

  it("fetches a fresh key on every call", async () => {
    let key = 0;
    respond = (url) => {
      if (url.pathname !== "/ads.php") return new Response("");
      key += 1;
      return new Response(`<a href="get.php?md5=${md5}&amp;key=K${key}">GET</a>`);
    };

    const first = await getDownloadUrls(md5);
    const second = await getDownloadUrls(md5);

    expect(first.libgenMirrors).toEqual([
      `https://libgen.li/get.php?md5=${md5}&key=K1`,
    ]);
    expect(second.libgenMirrors).toEqual([
      `https://libgen.li/get.php?md5=${md5}&key=K2`,
    ]);
  });

  it("returns no sources when LibGen has no file for the id", async () => {
    respond = () => new Response("<html><body>No file</body></html>");

    const urls = await getDownloadUrls("00000000000000000000000000000000");
    expect(urls).toEqual({ libgenMirrors: [] });
  });

  it("throws TypeError on an empty id", async () => {
    await expect(getDownloadUrls("")).rejects.toThrow(TypeError);
    await expect(getDownloadUrls("  ")).rejects.toThrow(TypeError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("throws LibraryFetchError with the HTTP status", async () => {
    respond = () => new Response("forbidden", { status: 403 });

    const error = await getDownloadUrls(md5).catch((err: unknown) => err);
    expect(error).toBeInstanceOf(LibraryFetchError);
    expect((error as LibraryFetchError).statusCode).toBe(403);
  });
});

describe("LibraryFetchError", () => {
  it("carries a message, name and status code", () => {
    const error = new LibraryFetchError("Test error", 404);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("Test error");
    expect(error.statusCode).toBe(404);
    expect(error.name).toBe("LibraryFetchError");
  });
});
