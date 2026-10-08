# API

The package exports two functions, two types and one error class. They are
declared in [`src/index.ts`](../src/index.ts).

```ts
import {
  searchBooks,
  getDownloadUrls,
  LibraryFetchError,
  type Book,
  type DownloadUrls,
} from "@totallynotdavid/books";
```

## searchBooks(query)

```ts
function searchBooks(query: string): Promise<Book[]>;
```

Searches the title column of libgen.li and returns the matching files. One
request fetches one page of 25 results, so the array holds at most 25 books. The
array is empty when nothing matches. A file listed twice in the results appears
once.

`query` must contain a non-whitespace character. Otherwise the promise rejects
with a `TypeError` and no request is sent.

The search covers the Libgen collection (topic `l`) in the files view. See
[`src/search.ts`](../src/search.ts) for the query parameters.

### Book

```ts
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

| Field       | Meaning                                                                                              |
| ----------- | ---------------------------------------------------------------------------------------------------- |
| `id`        | The file's MD5 hash, 32 lowercase hex characters. Pass it to `getDownloadUrls`.                      |
| `title`     | The title without the edition or volume note LibGen prints beside it.                                |
| `authors`   | The names parsed from LibGen's author text. Empty when LibGen lists none. See [authors](authors.md). |
| `fileType`  | The file extension, such as `pdf` or `epub`.                                                         |
| `fileSize`  | The size as LibGen prints it, such as `3 MB`.                                                        |
| `year`      | The first four-digit number in LibGen's year cell.                                                   |
| `language`  | The language as LibGen prints it.                                                                    |
| `thumbnail` | Never set. The results page has no cover images.                                                     |

An optional field is absent, not `null` or empty, when LibGen has no value for
it.

## getDownloadUrls(bookId)

```ts
function getDownloadUrls(bookId: string): Promise<DownloadUrls>;
```

Fetches the file page and the ads page of one book from libgen.li and returns
the links on them. `bookId` is a `Book.id`. Surrounding whitespace is trimmed.
An empty or whitespace-only `bookId` rejects with a `TypeError`, with no request
sent.

```ts
interface DownloadUrls {
  ipfs?: string;
  libgenMirrors: string[];
}
```

| Field           | Meaning                                                                                 |
| --------------- | --------------------------------------------------------------------------------------- |
| `ipfs`          | The IPFS.io gateway link from the file page. Absent when the page has none.             |
| `libgenMirrors` | The `get.php` link from the ads page, as an absolute URL. Empty when the page has none. |

The `get.php` link carries a `key` that expires. Each call fetches a new one, so
call `getDownloadUrls` right before the download starts and do not store the
result.

## Errors

| Error               | Thrown when                                                                                                                                                                                                      |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TypeError`         | An argument is empty. See [`searchBooks`](#searchbooksquery) and [`getDownloadUrls`](#getdownloadurlsbookid). `getDownloadUrls` also throws it when the ads page holds a `get.php` link that is not a valid URL. |
| `LibraryFetchError` | A request fails: an HTTP error status, a network error, or a timeout.                                                                                                                                            |

`LibraryFetchError` extends `Error` and adds `statusCode`. It is the HTTP status
of the response, or `0` when no response arrived. Every request times out after
30 seconds. The shared request code is in [`src/http.ts`](../src/http.ts).

```ts
import { searchBooks, LibraryFetchError } from "@totallynotdavid/books";

try {
  await searchBooks("dune");
} catch (error) {
  if (error instanceof LibraryFetchError) {
    console.log(error.statusCode);
  }
}
```
