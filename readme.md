# [pkg]: @totallynotdavid/books

[![NPM Version](https://img.shields.io/npm/v/@totallynotdavid/books?logo=npm&logoColor=212121&label=version&labelColor=ffc44e&color=212121)](https://www.npmjs.com/package/@totallynotdavid/books)
[![codecov](https://codecov.io/gh/totallynotdavid/books/graph/badge.svg?token=8OBBAZG8MN)](https://codecov.io/gh/totallynotdavid/books)

Search and download books by title, author, or ISBN.

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
  id: "1234567890abcdef",
  title: "The Pragmatic Programmer",
  authors: ["David Thomas", "Andrew Hunt"],
  fileType: "pdf",
  fileSize: "4.2 MB",
  year: 2019,
  language: "English",
  thumbnail: "https://..."
}
```

The search returns book metadata including title, authors, file type, size,
year, language, and thumbnail. Download URLs include IPFS gateways and direct
mirrors.

```ts
const urls = await getDownloadUrls(books[0].id);
console.log(urls);
```

```js
{
  ipfs: "https://ipfs.io/ipfs/...",
  libgenMirrors: ["https://libgen.li/get.php?md5=..."]
}
```

## API reference

### searchBooks(query)

Search for books by title, author, or ISBN. Returns a promise resolving to an
array of book objects:

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

Get download URLs for a book using its ID from the search results. Returns a
promise resolving to download URLs:

```ts
const urls = await getDownloadUrls(books[0].id);

interface DownloadUrls {
  ipfs?: string;
  libgenMirrors: string[];
}
```

### Error handling

The package throws `AnnasArchiveError` on HTTP failures. The error includes a
status code:

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
