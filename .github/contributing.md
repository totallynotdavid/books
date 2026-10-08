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
bun install
```

## Commands

| Command         | Effect                                                                              |
| --------------- | ----------------------------------------------------------------------------------- |
| `bun test`      | Runs all tests.                                                                     |
| `bun run check` | Lints with Biome, then formats every `.md` and `.yml` file with Prettier, in place. |
| `bun run build` | Runs `check`, then bundles `src/index.ts` into `dist/` with bunup.                  |

## Tests

Tests never touch the network. [`tests/fixtures/`](../tests/fixtures/) holds
pages saved from libgen.li. The search and download parser tests load a fixture,
parse it, and assert on the typed result. The author parser tests pass strings.
[`tests/integration.test.ts`](../tests/integration.test.ts) replaces the global
`fetch` with a function that serves the fixtures, so it runs `searchBooks` and
`getDownloadUrls` end to end.

## Common changes

| Change                | Files                                                                |
| --------------------- | -------------------------------------------------------------------- |
| A new name format     | See [Add a name format](../docs/authors.md#add-a-name-format).       |
| A new field on `Book` | `src/types.ts`, `parseRow()` in `src/parsers/search.ts`, and a test. |
| A new download source | `src/parsers/download.ts`, `src/download.ts`, and a test.            |

[docs/api.md](../docs/api.md) states the public behavior.

## Submit a change

Open a pull request against `master`.
