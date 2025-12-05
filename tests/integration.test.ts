import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseSearchResults } from "../src/parsers/search.ts";
import type { Book } from "../src/types.ts";

describe("Integration: Book search parser", () => {
  const fixturePath = join(import.meta.dir, "fixtures", "search.html");
  const html = readFileSync(fixturePath, "utf8");
  const books = parseSearchResults(html);

  const expected: Book[] = [
    {
      id: "655f86a6f99a3dee5e0ce409c4a6dfdc",
      title: "Docker for Rails Developers: Build, Ship, and Run Your Applications Everywhere",
      authors: ["Rob Isenberg"],
      language: "en",
      fileType: "PDF",
      fileSize: "5.1MB",
      year: 2019,
      thumbnail: "https://example.com/thumb.jpg",
    },
    {
      id: "7c28ff2ffa73af8c06a170e1d190a408",
      title: "Javascript: Javascript Programming For Absolute Beginners",
      authors: ["William Sullivan"],
      language: "en",
      fileType: "LIT",
      fileSize: "0.3MB",
      year: 2017,
      thumbnail: "https://example.com/thumb2.jpg",
    },
    {
      id: "5f42c8fcb4d4178fab9f9a6aafd7effc",
      title: "Easy Learning Data Structures & Algorithms ES6+Javascript",
      authors: ["Yang Hu"],
      language: "en",
      fileType: "EPUB",
      fileSize: "13.7MB",
      year: 2019,
      thumbnail: "https://example.com/thumb3.jpg",
    },
    {
      id: "448a65ee05782afd982ababcdfb155be",
      title: "JavaScript-mancy: Object-Oriented Programming",
      authors: ["Jaime González García", "Artur Mizera"],
      language: "en",
      fileType: "EPUB",
      fileSize: "0.6MB",
      year: undefined,
      thumbnail: "https://example.com/thumb4.jpg",
    },
    {
      id: "a792f314180a972852f61e313eaaf30d",
      title: "JavaScript In 8 Hours: For Beginners, Learn JavaScript Fast!",
      authors: ["Ray Yao", "Ada R. Swift", "Ruby C. Perl"],
      language: "en",
      fileType: "AZW3",
      fileSize: "0.2MB",
      year: 2015,
      thumbnail: "https://example.com/thumb5.jpg",
    },
    {
      id: "f992f5acc7a903314912f74ed2a46afd",
      title: "JavaScript Programming : Beginner to Professional",
      authors: ["Rahul Maurya", "Rahul Maurya"],
      language: "en",
      fileType: "EPUB",
      fileSize: "0.9MB",
      year: 2020,
      thumbnail: "https://example.com/thumb6.jpg",
    },
    {
      id: "61a6978c57cded15361cc505c627c0a2",
      title: "JavaScript: Best Practice",
      authors: ["SitePoint"],
      language: "en",
      fileType: "EPUB",
      fileSize: "0.3MB",
      year: 2018,
      thumbnail: "https://example.com/thumb7.jpg",
    },
    {
      id: "b84f2227e629e30522f543196cc0e0e7",
      title: "Python Programming & Javascript",
      authors: ["Lina Polly"],
      language: "en",
      fileType: "PDF",
      fileSize: "0.4MB",
      year: undefined,
      thumbnail: "https://example.com/thumb8.jpg",
    },
    {
      id: "991f5e845c9582677f4848af313e3d20",
      title: "Je brille mais ne brûle point: Shine Not Burn (édition française)",
      authors: ["Elle Casey"],
      language: "en",
      fileType: "EPUB",
      fileSize: "0.4MB",
      year: 2014,
      thumbnail: "https://example.com/thumb9.jpg",
    },
    {
      id: "3016859e0a378254f48d68dc8849f1b0",
      title: "JUMP Math Cahier 5.2: Édition Française (French Edition)",
      authors: ["John Mighton", "Jump Math"],
      language: "fr",
      fileType: "PDF",
      fileSize: "5.3MB",
      year: 2012,
      thumbnail: "https://example.com/thumb10.jpg",
    },
    {
      id: "9a9dc82a36599861ffe8d7eb815383f5",
      title: "Compiler Design Tutorial",
      authors: ["https://www.tutorialspoint.com/"],
      language: "en",
      fileType: "PDF",
      fileSize: "1.8MB",
      year: 2014,
      thumbnail: "https://example.com/thumb11.jpg",
    },
    {
      id: "1d09a2d812c59b14ecfeacbfd518e246",
      title: "A modern chronicle",
      authors: ["Winston Churchill", "J.H. Gardner Soper"],
      language: "en",
      fileType: "TXT",
      fileSize: "1.0MB",
      year: 1913,
      thumbnail: "https://example.com/thumb12.jpg",
    },
    {
      id: "688521c38562a4896afda5fa667f79a7",
      title: "An object-oriented approach to compiler design",
      authors: ["Martin J."],
      language: "en",
      fileType: "DJVU",
      fileSize: "2.8MB",
      year: 2003,
      thumbnail: "https://example.com/thumb13.jpg",
    },
    {
      id: "d260aba90f9df2b2fafa2c66c75e7a6f",
      title: "Мой Oxford англо-русский словарь в картинках",
      authors: ["Sheila Pemberton", "И. Б. Соболева", "Val Biro"],
      language: "ru",
      fileType: "PDF",
      fileSize: "15.2MB",
      year: 1997,
      thumbnail: "https://example.com/thumb14.jpg",
    },
    {
      id: "4a777538b43b35f43bb190225e91ff21",
      title: "Η αρχαία Θεσσαλία. Γεωγραφική και ιστορική περιγραφή",
      authors: ["Stahlin Friedrich"],
      language: "grc",
      fileType: "DJVU",
      fileSize: "8.1MB",
      year: 2008,
      thumbnail: "https://example.com/thumb15.jpg",
    },
    {
      id: "8f4dd448cc992b8ab4a38dd056b09478",
      title: "Advanced Programming in the UNIX Environment, 3rd Edition",
      authors: ["W. Richard Stevens", "Stephen A. Rago"],
      language: "en",
      fileType: "PDF",
      fileSize: "4.2MB",
      year: 2013,
      thumbnail: "https://example.com/thumb16.jpg",
    },
    {
      id: "23859913f1406286ca84218393461617",
      title: "Contra eos qui subintroductas habent virgines",
      authors: ["St. John Chrysostom"],
      language: "en",
      fileType: "EPUB",
      fileSize: "0.5MB",
      year: undefined,
      thumbnail: "https://example.com/thumb17.jpg",
    },
  ];

  it("parses all books correctly", () => {
    expect(books).toEqual(expected);
  });

  it("extracts valid MD5 IDs", () => {
    for (const book of books) {
      expect(book.id).toMatch(/^[a-f0-9]{32}$/);
    }
  });

  it("never returns empty authors", () => {
    for (const book of books) {
      expect(book.authors.length).toBeGreaterThan(0);
    }
  });

  it("properly capitalizes all authors", () => {
    for (const book of books) {
      for (const author of book.authors) {
        // Skip initials
        if (/*author.startsWith("http") ||*/ author.includes(".")) continue;

        // First letter should be uppercase
        expect(author[0]).toMatch(/[A-ZА-ЯЁ]/);
      }
    }
  });
});
