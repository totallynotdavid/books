# @totallynotdavid/books

[![NPM Version](https://img.shields.io/npm/v/@totallynotdavid/books?logo=npm&logoColor=212121&label=version&labelColor=ffc44e&color=212121)](https://www.npmjs.com/package/@totallynotdavid/books)
[![codecov](https://codecov.io/gh/totallynotdavid/books/graph/badge.svg?token=8OBBAZG8MN)](https://codecov.io/gh/totallynotdavid/books)

A TypeScript library for Node.js and Bun that searches
[Library Genesis](https://libgen.li) by title and returns download links. It
reads the HTML pages of libgen.li, so it needs network access to that site and
no API key.

## Get started

```sh
npm install @totallynotdavid/books
```

```ts
import { searchBooks, getDownloadUrls } from "@totallynotdavid/books";

const [book] = await searchBooks("dune");
if (!book) throw new Error("No results");
console.log(book);

const urls = await getDownloadUrls(book.id);
console.log(urls);
```

`searchBooks` resolves to an array of books. The values depend on what LibGen
lists:

```js
{
  id: "5ac0ff98513e82598e5396cc78732a4c",
  title: "The Dune Encyclopedia",
  authors: ["Frank Patrick Herbert", "Willis E. McNelly"],
  fileType: "pdf",
  fileSize: "10 MB",
  year: 1984,
  language: "English"
}
```

`getDownloadUrls` resolves to the links for one book:

```js
{
  ipfs: "https://gateway.ipfs.io/ipfs/...",
  libgenMirrors: ["https://libgen.li/get.php?md5=...&key=..."]
}
```

## Features

- Search by title and read typed results.
- Get the available IPFS gateway and libgen.li mirror links for a book.
- Get the authors of a book as a list of strings.
- Catch request failures as a `LibraryFetchError`.

See the
[API reference](https://github.com/totallynotdavid/books/blob/master/docs/api.md)
for the contract of each function.

## Documentation

- [Manual](https://github.com/totallynotdavid/books/blob/master/docs/readme.md):
  API reference, author parsing, and the code map.
- [Contributing](https://github.com/totallynotdavid/books/blob/master/.github/contributing.md):
  set up, check, and submit a change.

## License

[MIT](LICENSE)
