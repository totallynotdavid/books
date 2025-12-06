import { describe, expect, it } from "bun:test";
import { searchBooks, getDownloadUrls, AnnasArchiveError } from "../src/index.ts";

describe("integration: searchBooks", () => {
  it("returns array of books with required fields", async () => {
    const books = await searchBooks("javascript");

    expect(books.length).toBeGreaterThan(0);

    const book = books[0];
    if (!book) return;
    expect(book.id).toMatch(/^[a-f0-9]{32}$/);
    expect(book.title.length).toBeGreaterThan(0);
    expect(book.authors.length).toBeGreaterThan(0);

    for (const author of book.authors) {
      expect(author.length).toBeGreaterThan(0);
    }
  }, 15_000);

  it("returns empty array when no results found", async () => {
    const books = await searchBooks("xyzabc123nonexistent987qwerty");
    expect(books).toEqual([]);
  }, 15_000);

  it("throws TypeError on empty query", () => {
    expect(searchBooks("")).rejects.toThrow(TypeError);
    expect(searchBooks("  ")).rejects.toThrow(TypeError);
  });

  it("parses optional metadata fields correctly", async () => {
    const books = await searchBooks("programming");

    expect(books.length).toBeGreaterThan(10);

    const withYear = books.filter((b) => b.year !== undefined);
    const withLanguage = books.filter((b) => b.language !== undefined);
    const withFileType = books.filter((b) => b.fileType !== undefined);

    expect(withYear.length).toBeGreaterThan(0);
    expect(withLanguage.length).toBeGreaterThan(0);
    expect(withFileType.length).toBeGreaterThan(0);

    for (const book of books) {
      expect(book.id).toMatch(/^[a-f0-9]{32}$/);
      expect(book.title).toBeTruthy();
      expect(book.authors.length).toBeGreaterThan(0);

      if (book.language) {
        expect(book.language).toMatch(/^[a-z]{2,3}$/);
      }

      if (book.year) {
        expect(book.year).toBeGreaterThan(1900);
        expect(book.year).toBeLessThan(2100);
      }
    }
  }, 15_000);

  it("never returns empty author arrays", async () => {
    const books = await searchBooks("algorithms");

    for (const book of books) {
      expect(book.authors.length).toBeGreaterThan(0);

      for (const author of book.authors) {
        expect(author.length).toBeGreaterThan(0);
      }
    }
  }, 15_000);
});

describe("integration: getDownloadUrls", () => {
  it("returns DownloadUrls with at least one source", async () => {
    const books = await searchBooks("javascript");
    const bookId = books[0]?.id;
    if (typeof bookId !== "string") throw new Error("bookId is not defined");

    const urls = await getDownloadUrls(bookId);

    const hasDownload = urls.ipfs || urls.libgenMirrors.length > 0;
    expect(!!hasDownload).toBe(true);

    if (urls.ipfs) {
      expect(urls.ipfs).toMatch(/^https:\/\//);
      expect(urls.ipfs).toContain("ipfs");
    }

    for (const mirror of urls.libgenMirrors) {
      expect(mirror).toMatch(/^https:\/\//);
      expect(mirror).toContain("libgen");
    }
  }, 30_000);

  it("throws TypeError on empty bookId", () => {
    expect(getDownloadUrls("")).rejects.toThrow(TypeError);
    expect(getDownloadUrls("  ")).rejects.toThrow(TypeError);
  });

  it("throws AnnasArchiveError on HTTP failures", async () => {
    const invalidId = "00000000000000000000000000000000";

    try {
      await getDownloadUrls(invalidId);
    } catch (error) {
      expect(error).toBeInstanceOf(AnnasArchiveError);
      if (error instanceof AnnasArchiveError) {
        expect(error.statusCode).toBeGreaterThan(0);
      }
    }
  }, 15_000);
});

describe("integration: end-to-end workflow", () => {
  it("search ⇢ extract ID ⇢ get download URLs", async () => {
    const books = await searchBooks("design patterns");

    expect(books.length).toBeGreaterThan(0);

    const book = books[0];
    if (!book) return;
    expect(book.id).toMatch(/^[a-f0-9]{32}$/);
    expect(book.title.length).toBeGreaterThan(0);
    expect(book.authors.length).toBeGreaterThan(0);

    const urls = await getDownloadUrls(book.id);

    const hasDownload = urls.ipfs || urls.libgenMirrors.length > 0;
    expect(!!hasDownload).toBe(true);
  }, 15_000);

  it("handles multiple books and download URL fetches", async () => {
    const books = await searchBooks("python");

    expect(books.length).toBeGreaterThan(3);

    const firstThree = books.slice(0, 3);

    for (const book of firstThree) {
      const urls = await getDownloadUrls(book.id);

      expect(urls).toBeDefined();
      expect(urls.libgenMirrors).toBeInstanceOf(Array);
    }
  }, 30_000);
});

describe("integration: Error handling", () => {
  it("AnnasArchiveError provides statusCode", () => {
    const error = new AnnasArchiveError("Test error", 404);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AnnasArchiveError);
    expect(error.message).toBe("Test error");
    expect(error.statusCode).toBe(404);
    expect(error.name).toBe("AnnasArchiveError");
  });
});
