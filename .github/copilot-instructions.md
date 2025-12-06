# Instructions

Principles:

- Simplicity as a scaling strategy (dumb, explicit, predictable components)
- Minimal moving parts
- Maintainability
- Code as documentation (comments should only be used for non-obvious decisions
  or for JSDoc)

Book search/download lib:

- searchBooks(query)⇢Book[],
- getDownloadUrls(md5)⇢DownloadUrls

Commands: bun test | bun run check | bun run build

Architecture: src/{search,download}.ts orchestrate; src/parsers/ extract data
via Cheerio; src/parsers/authors/ splits/transforms author strings using
strategy pattern

Conventions:

- imports require .ts extension
- AnnasArchiveError for HTTP failures (with statusCode), TypeError for invalid
  input
- parsers return null on missing element, never throw
- Book optional fields use undefined not null
- noUncheckedIndexedAccess enabled: use optional chaining on array access

Author parser (src/parsers/authors/):

- strategies.ts: ALL_STRATEGIES checked in order
  (semicolon⇢period-delimited⇢comma+and⇢and⇢comma⇢single). New format = add
  strategy with detect()+split(), insert at correct priority
- transforms.ts: ALL_TRANSFORMS applied sequentially. Order matters:
  clean⇢expand⇢normalize
- special-cases.ts: bibliographic terms (Collection/Editor) replaced by
  publisher fallback

Testing: fixtures in tests/fixtures/\*.html; load, parse, assert. Pattern:
fixture⇢parser⇢typed object assertions

Extend: new author format⇢strategies.ts+tests; new download
source⇢parsers/download.ts+src/download.ts; new Book
field⇢types.ts+parsers/search.ts extractMetadata()
