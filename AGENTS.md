# Agent rules

Read [docs/architecture.md](docs/architecture.md) for the code map,
[docs/api.md](docs/api.md) for the contract of the public functions, errors and
optional fields, [docs/authors.md](docs/authors.md) for author parsing, and
[.github/contributing.md](.github/contributing.md) for the commands and the test
setup.

- Keep components dumb, explicit and predictable. Add no moving part that the
  change does not need.
- Use comments only for non-obvious decisions or JSDoc.
- Imports carry the `.ts` extension.
- `noUncheckedIndexedAccess` is on. Use optional chaining on array access.
