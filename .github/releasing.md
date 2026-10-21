# Releasing

A push of a tag named `v*` runs [`release.yml`](workflows/release.yml). It
checks the tag and the notes, builds and packs the package, publishes it to npm,
then creates the GitHub release. Nothing else publishes.

The same workflow runs on every pull request and on a manual run
(`gh workflow run release.yml --ref <branch>`) as a dry run. It does every step
except the upload steps. A release that would fail fails its pull request before
merge.

## Set up once

A maintainer who forks the project does these steps with their own accounts.

1. In `package.json`, set `name` to a package you own on npm, such as
   `@your-scope/books`, and set `repository.url` to your fork.
2. In `.github/workflows/release.yml`, replace `totallynotdavid` in the
   `publish` job's `if` line with your GitHub user or organization. The job is
   skipped for any other owner.
3. In the repository, open Settings, Environments, and create an environment
   named `publishing`. Add required reviewers if you want an approval before
   each publish. If you limit deployment branches, allow the tag pattern `v*`.
4. Publish the first version by hand so the package exists on npm: run
   `npm login`, then `bun run build`, then `npm publish --access public`.
5. On npmjs.com, open the package, then Settings, then Trusted Publisher, and
   choose GitHub Actions. Enter your GitHub user or organization, the repository
   name, the workflow file name `release.yml`, and the environment name
   `publishing`.

The workflow holds no npm token and needs no repository secret. It publishes
with GitHub's OIDC identity (`id-token: write`), which the trusted publisher
from step 5 accepts. Do not add an `NPM_TOKEN` secret.

## Prepare a release

1. Pick the version. While the major is 0, a breaking change bumps the minor and
   a fix bumps the patch.
2. Set `version` in `package.json`. The lockfile carries no version for the
   project.
3. Write `.github/release-notes.md`. Its first line must be exactly
   `<name> <version> is out.`, where `<name>` is the `name` in `package.json`,
   for example `@totallynotdavid/books 0.1.0 is out.` The rest is the
   announcement: what changed, the breaking changes with a before and after
   snippet, known problems, and how to upgrade. GitHub appends its generated
   change list to it.
4. Run `bun run check`. It lints, type-checks, tests and builds.
5. Open a pull request. The `release` workflow runs as a dry run. Merge only
   when it passes.
6. Merge the change into `master`.

## Dry run

On a pull request or a manual run, the `release` workflow runs two jobs. Neither
uploads to npm or GitHub.

- `preflight` checks that every `environment:` named in the workflow exists in
  the repository, using `gh api` and the job's `GITHUB_TOKEN`. It also checks
  that the package exists on npm. Publishing uses OIDC, so the workflow holds no
  npm token to check.
- `build` fails when the first line of `.github/release-notes.md` is not
  `<name> <version> is out.`. It then runs `bun install --frozen-lockfile` and
  `bun run build`, packs the tarball with `npm pack`, installs the tarball into
  an empty project, imports it, and stores it as the `package` artifact.

The `publish` and `github` jobs are skipped.

## Publish

Tag the merge commit and push the tag:

```sh
git tag v0.1.0
git push origin v0.1.0
```

Replace `0.1.0` with the version in `package.json`. The workflow then runs:

1. `preflight`, as in the dry run;
2. `build`, as in the dry run. It also fails first when the tag is not `v` plus
   the `package.json` version;
3. `publish`, which waits for the `publishing` environment, then runs
   `npm publish` on the tarball that `build` packed;
4. `github`, which runs after `publish` succeeds and creates the GitHub release
   for the tag. The body is `.github/release-notes.md` followed by the generated
   change list.

A failed check stops the run before anything is published. Fix the file, delete
the remote tag with `git push origin :refs/tags/v0.1.0` and the local tag with
`git tag -d v0.1.0`, then tag again.

## Verify

Watch the run, then confirm both outputs:

```sh
gh run watch
npm view @totallynotdavid/books version
gh release view v0.1.0
```

`npm view` prints the new version. `gh release view` shows the notes you wrote
above the generated list. A published npm version cannot be replaced. If it is
wrong, fix forward with a new patch version.
