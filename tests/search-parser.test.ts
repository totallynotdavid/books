import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseSearchResults } from "../src/parsers/search.ts";

describe("parseSearchResults on a real libgen.li page", () => {
  const html = readFileSync(
    join(import.meta.dir, "fixtures", "libgen-search.html"),
    "utf8",
  );
  const books = parseSearchResults(html);

  it("extracts every row", () => {
    expect(books).toBeArrayOfSize(25);
  });

  it("uses the md5 from the ads.php link as the id", () => {
    for (const book of books) {
      expect(book.id).toMatch(/^[a-f0-9]{32}$/);
    }
    expect(books[0]?.id).toBe("5ac0ff98513e82598e5396cc78732a4c");
  });

  it("reads all columns of a row", () => {
    expect(books[19]).toEqual({
      id: "840e6f0826109b93b4355dadd04240ee",
      title: "Dune, 40th Anniversary Edition",
      authors: ["Frank Herbert"],
      fileType: "pdf",
      fileSize: "3 MB",
      year: 2005,
      language: "English",
    });
  });

  it("drops the edition note from the title", () => {
    expect(books[0]?.title).toBe("The Dune Encyclopedia");
    expect(books[11]?.title).toBe("Dune Chronicles. 01 - Dune");
  });

  it("takes the year from a compound year cell", () => {
    expect(books[0]?.year).toBe(1984);
  });

  it("parses multiple authors", () => {
    expect(books[0]?.authors).toEqual([
      "Frank Patrick Herbert",
      "Willis E. McNelly",
    ]);
    expect(books[14]?.authors).toEqual(["Brian Herbert", "Kevin J. Anderson"]);
  });

  it("leaves out fields LibGen does not provide", () => {
    for (const book of books) {
      expect(book).not.toHaveProperty("thumbnail");
    }
  });
});

const row = (md5: string, title: string, year = "") => `
  <tr>
    <td><a href="edition.php?id=1">${title}</a></td>
    <td>Frank Herbert</td>
    <td></td>
    <td>${year}</td>
    <td></td>
    <td>16</td>
    <td><nobr><a href="/file.php?id=1"></a></nobr></td>
    <td></td>
    <td><a href="/ads.php?md5=${md5}">1</a></td>
  </tr>`;
const table = (rows: string) =>
  `<table id="tablelibgen"><thead><tr><th></th></tr></thead><tbody>${rows}</tbody></table>`;

describe("parseSearchResults edge cases", () => {
  const md5 = "4c4a6a9e3c8fef7ecf0f2b8ca66eb4ab";

  it("returns an empty array when the table has no rows", () => {
    expect(parseSearchResults(table(""))).toEqual([]);
  });

  it("returns an empty array for unrelated HTML", () => {
    expect(parseSearchResults("<div>Not a results page</div>")).toEqual([]);
  });

  it("keeps the first row for a repeated md5", () => {
    const books = parseSearchResults(
      table(row(md5, "Dune") + row(md5.toUpperCase(), "Dune again")),
    );
    expect(books).toEqual([{ id: md5, title: "Dune", authors: ["Frank Herbert"] }]);
  });

  it("does not assign empty optional fields", () => {
    const [book] = parseSearchResults(table(row(md5, "Dune")));
    expect(Object.keys(book ?? {})).toEqual(["id", "title", "authors"]);
  });

  it("skips rows without an md5 or a title", () => {
    const html = table(
      row("not-an-md5", "Dune") + row(md5, "") + row(md5, "Dune", "1965"),
    );
    expect(parseSearchResults(html)).toEqual([
      { id: md5, title: "Dune", authors: ["Frank Herbert"], year: 1965 },
    ]);
  });
});
