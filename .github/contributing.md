# Contributing

## The codebase

[docs/architecture.md](../docs/architecture.md) maps the source. Code
conventions are in [AGENTS.md](../AGENTS.md).

## Set up

The repository pins its tools in [mise.toml](../mise.toml). With
[mise](https://mise.jdx.dev) installed:

```sh
git clone https://github.com/totallynotdavid/books
cd books
mise install
mise run install
```

## Commands

Every command is a mise task, defined in [mise.toml](../mise.toml).

| Command              | Effect                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------- |
| `mise run install`   | Installs the dependencies from `bun.lock`.                                                  |
| `mise run lint`      | Lints and checks formatting: Biome for code, oxfmt for `.md`, `.yml` and `.json`.           |
| `mise run fix`       | Applies the safe Biome fixes and formats the code, `.md`, `.yml` and `.json` files.         |
| `mise run typecheck` | Type-checks with `tsc`.                                                                     |
| `mise run test`      | Runs all tests.                                                                             |
| `mise run build`     | Bundles `src/index.ts` into `dist/` with bunup.                                             |
| `mise run check`     | Runs `lint`, `typecheck`, `test` and `build`. It does not modify tracked files. CI runs it. |

When `lint` reports a problem, run `mise run fix`, then fix what it leaves.

## Tests

Tests never touch the network. [`tests/fixtures/`](../tests/fixtures/) holds
pages saved from libgen.li. The search and download parser tests parse a fixture
or a short HTML string and assert on the typed result. The author parser tests
pass strings. [`tests/integration.test.ts`](../tests/integration.test.ts)
replaces the global `fetch` with a function that serves the fixtures, so it runs
`searchBooks` and `getDownloadUrls` end to end.

## Common changes

| Change                | Files                                                                |
| --------------------- | -------------------------------------------------------------------- |
| A new name format     | See [Add a name format](../docs/authors.md#add-a-name-format).       |
| A new field on `Book` | `src/types.ts`, `parseRow()` in `src/parsers/search.ts`, and a test. |
| A new download source | `src/parsers/download.ts`, `src/download.ts`, and a test.            |

[docs/api.md](../docs/api.md) states the public behavior.

## Submit a change

Open a pull request against `master`.
