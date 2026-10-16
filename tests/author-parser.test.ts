import { describe, expect, it } from "bun:test";
import { parseAuthors } from "../src/parsers/authors/index.ts";

const cases: [description: string, input: string, expected: string[]][] = [
  ["blank text", "  ", []],
  ["a single name", "Rob Isenberg", ["Rob Isenberg"]],
  [
    "a URL",
    "https://www.tutorialspoint.com/",
    ["https://www.tutorialspoint.com/"],
  ],
  ["a word that is a property of Object", "constructor", ["Constructor"]],

  ["a lowercase Last, First pair", "hu, yang", ["Yang Hu"]],
  ["an uppercase Last, First pair", "SMITH, JOHN", ["John Smith"]],
  ["a multi-word surname", "Van Der Berg, Hans", ["Hans Van Der Berg"]],
  ["an apostrophe", "O'Brien, Patrick", ["Patrick O'Brien"]],
  ["a hyphen", "Smith-Jones, Mary", ["Mary Smith-Jones"]],
  ["accented letters", "García, José", ["José García"]],
  ["mixed case", "DeVito, Danny", ["Danny DeVito"]],
  ["mixed case in a full name", "Willis E. McNelly", ["Willis E. McNelly"]],
  ["trailing initial", "Martin J.", ["Martin J."]],
  ["leading initials", "J.K. Rowling", ["J.K. Rowling"]],
  ["a title with a period", "Dr. Smith", ["Dr. Smith"]],
  ["a trailing period on a word", "Val Biro.", ["Val Biro"]],

  [
    "a semicolon",
    "Maurya, Rahul; Maurya, Rahul",
    ["Rahul Maurya", "Rahul Maurya"],
  ],
  ["'and'", "John Doe and Jane Smith", ["John Doe", "Jane Smith"]],
  [
    "'&'",
    "W. Richard Stevens & Stephen A. Rago",
    ["W. Richard Stevens", "Stephen A. Rago"],
  ],
  [
    "comma and 'and'",
    "Ray Yao, Ada R. Swift, and Ruby C. Perl",
    ["Ray Yao", "Ada R. Swift", "Ruby C. Perl"],
  ],
  [
    "'and' between Last, First pairs",
    "Иванов, Петр and Smith, John",
    ["Петр Иванов", "John Smith"],
  ],
  [
    "Last, First, Organization",
    "Mighton, John, Jump Math",
    ["John Mighton", "Jump Math"],
  ],
  [
    "a third part that is not a suffix",
    "Smith, John, Lee",
    ["John Smith", "Lee"],
  ],
  [
    "period-delimited roles",
    "Составитель - Sheila Pemberton. Русский Текст - И. Б. Соболева. Иллюстрации - Val Biro.",
    ["Sheila Pemberton", "И. Б. Соболева", "Val Biro"],
  ],

  ["a bracketed alias", "Casey, Elle [Casey, Elle]", ["Elle Casey"]],
  [
    "a parenthesized role",
    "Jaime González García, Artur Mizera (editor)",
    ["Jaime González García", "Artur Mizera"],
  ],
  [
    "'By' and 'Illustrated by' prefixes",
    "By Winston Churchill, Illustrated by J.H. Gardner Soper",
    ["Winston Churchill", "J.H. Gardner Soper"],
  ],
  ["a Russian role prefix", "Иллюстрации - Val Biro", ["Val Biro"]],

  [
    "a title after Last, First",
    "Chrysostom, John, St.",
    ["St. John Chrysostom"],
  ],
  ["a suffix after Last, First", "King, Martin, Jr.", ["Martin King Jr."]],
  ["a roman suffix with a period", "Smith, John, III.", ["John Smith III"]],
  ["a lowercase roman suffix", "Smith, John, iv", ["John Smith IV"]],
  [
    "a suffix before a semicolon",
    "Smith, John, III.; Doe, Jane",
    ["John Smith III", "Jane Doe"],
  ],

  ["'coll.'", "coll.", ["Collection"]],
  ["'ed' without a period", "ed", ["Editor"]],
  ["'eds.'", "eds.", ["Editors"]],
  ["'comp.'", "comp.", ["Compiler"]],
  ["'trans.'", "trans.", ["Translator"]],
];

describe("parseAuthors", () => {
  it.each(cases)("reads %s", (_description, input, expected) => {
    expect(parseAuthors(input)).toEqual(expected);
  });
});

const withPublisher: [
  description: string,
  authors: string,
  publisher: string,
  expected: string[],
][] = [
  ["replaces an abbreviation", "coll.", "SitePoint, 2018", ["SitePoint"]],
  [
    "replaces a spelled-out term",
    "Collection",
    "O'Reilly Media",
    ["O'Reilly Media"],
  ],
  ["keeps a real author", "John Doe", "SitePoint, 2018", ["John Doe"]],
  [
    "keeps the real author next to a placeholder",
    "Collection; Smith, John",
    "Penguin",
    ["Penguin", "John Smith"],
  ],
  [
    "keeps the real author before a placeholder",
    "Smith, John; ed.",
    "Penguin, 2005",
    ["John Smith", "Penguin"],
  ],
  ["names the publisher once", "Editor; Compiler", "Penguin", ["Penguin"]],
  [
    "keeps repeated real authors",
    "Smith, John; Smith, John",
    "Penguin",
    ["John Smith", "John Smith"],
  ],
  [
    "keeps the placeholder when the publisher is blank",
    "Collection; Smith, John",
    " ",
    ["Collection", "John Smith"],
  ],
];

describe("parseAuthors with a publisher", () => {
  it.each(withPublisher)(
    "%s",
    (_description, authors, publisher, expected) => {
      expect(parseAuthors(authors, publisher)).toEqual(expected);
    },
  );
});
