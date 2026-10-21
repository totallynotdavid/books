@totallynotdavid/books 0.1.0 is out.

It has been six months since 0.0.2. This release breaks two things, so read the
breaking changes before you upgrade.

The big change is the source. Search and downloads now use libgen.li instead of
Anna's Archive. Search reads the libgen.li files table and returns up to 25
results. The old site gave covers; libgen.li does not, so `Book.thumbnail` is
gone. `Book.id` is now the file's MD5 hash. Use ids from `searchBooks` only with
`getDownloadUrls`, not ids you saved from 0.0.2.

Download links changed too. The `get.php` link on libgen.li carries a key that
expires, so `getDownloadUrls` now fetches the ads page on every call. Call it
right before you download and do not store the result. It also returns an empty
`libgenMirrors` array, not a thrown `TypeError`, when the link on the page is
malformed.

Author parsing got several fixes. `Smith, John, III.` no longer becomes `Iii`.
Short names such as `Lee` are no longer mistaken for titles. Names like
`McNelly` and `DeVito` keep their capitals. A placeholder publisher such as
`Collection` no longer replaces the real authors next to it. A cell that reads
`constructor` no longer throws. The rest is tests, docs and build tooling: tests
run against saved pages instead of the network, and the docs now have an API
page, an authors page and an architecture page.

## Breaking changes

`AnnasArchiveError` is now `LibraryFetchError`. The old name pointed at a site
the package no longer uses. The class is the same: it extends `Error` and has
`statusCode`. Rename the import and the `instanceof` check.

Before:

```ts
import { searchBooks, AnnasArchiveError } from "@totallynotdavid/books";

try {
  await searchBooks("dune");
} catch (error) {
  if (error instanceof AnnasArchiveError) console.log(error.statusCode);
}
```

After:

```ts
import { searchBooks, LibraryFetchError } from "@totallynotdavid/books";

try {
  await searchBooks("dune");
} catch (error) {
  if (error instanceof LibraryFetchError) console.log(error.statusCode);
}
```

`Book.thumbnail` is removed. Nothing in libgen.li results supplies it.

Before:

```ts
const [book] = await searchBooks("dune");
const cover = book?.thumbnail;
```

After:

```ts
const [book] = await searchBooks("dune");
// Book has no thumbnail. Use id, title, authors, fileType, fileSize, year
// and language.
console.log(book?.title);
```

## Known problems

None known. The tests use saved libgen.li pages, so a change to that site's
markup can break search or downloads until the parsers follow it.

## What to do

Upgrade with `npm install @totallynotdavid/books@0.1.0`. Rename
`AnnasArchiveError`, drop any use of `thumbnail`, and run your own searches
once. Report problems at https://github.com/totallynotdavid/books/issues.
