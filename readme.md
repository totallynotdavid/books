# [pkg]: @totallynotdavid/books

[![NPM Version](https://img.shields.io/npm/v/@totallynotdavid/books?logo=npm&logoColor=212121&label=version&labelColor=ffc44e&color=212121)](https://www.npmjs.com/package/@totallynotdavid/books)
[![codecov](https://codecov.io/gh/totallynotdavid/books/graph/badge.svg?token=8OBBAZG8MN)](https://codecov.io/gh/totallynotdavid/books)

Search [Library Genesis](https://libgen.li) by title and get download links.

```sh
npm install @totallynotdavid/books
```

## Basic usage

Search for books and get download URLs using the book's ID:

```ts
import { searchBooks, getDownloadUrls } from "@totallynotdavid/books";

const books = await searchBooks("the pragmatic programmer");
console.log(books[0]);
```

```js
{
  id: "0a1b2c3d4e5f60718293a4b5c6d7e8f9",
  title: "The Pragmatic Programmer",
  authors: ["David Thomas", "Andrew Hunt"],
  fileType: "pdf",
  fileSize: "4 MB",
  year: 2019,
  language: "English"
}
```

The search returns up to 25 files per query. Each book's `id` is the file's MD5
hash. LibGen does not provide thumbnails, so `thumbnail` is never set. Download
URLs include an IPFS gateway link and a direct libgen.li link.

```ts
const urls = await getDownloadUrls(books[0].id);
console.log(urls);
```

```js
{
  ipfs: "https://gateway.ipfs.io/ipfs/...",
  libgenMirrors: ["https://libgen.li/get.php?md5=...&key=..."]
}
```

## API reference

### searchBooks(query)

Search LibGen by title. Returns a promise resolving to an array of book objects:

```ts
const books = await searchBooks("query");

interface Book {
  id: string;
  title: string;
  authors: string[];
  fileType?: string;
  fileSize?: string;
  year?: number;
  language?: string;
  thumbnail?: string;
}
```

### getDownloadUrls(bookId)

Get download URLs for a book using its ID from the search results. The `get.php`
link carries a key that expires, so each call fetches a new one; request the
URLs right before downloading. Returns a promise resolving to download URLs:

```ts
const urls = await getDownloadUrls(books[0].id);

interface DownloadUrls {
  ipfs?: string;
  libgenMirrors: string[];
}
```

### Error handling

The package throws `AnnasArchiveError` on HTTP failures from LibGen. The name is
kept from earlier versions, which searched Anna's Archive. The error includes a
status code, or 0 when the request never got a response:

```ts
import { searchBooks, AnnasArchiveError } from "@totallynotdavid/books";

try {
  const books = await searchBooks("query");
} catch (error) {
  if (error instanceof AnnasArchiveError) {
    console.log(error.statusCode);
  }
}
```
