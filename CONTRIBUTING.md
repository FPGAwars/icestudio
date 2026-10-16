# Contributing to Icestudio

Thank you for helping. This page covers the setup and the checks every change
goes through. To translate Icestudio, follow
[Translating Icestudio](https://github.com/FPGAwars/icestudio/wiki/Translating-Icestudio).

## Set up

1. Fork the repository on GitHub and clone your fork.
2. Install the Node.js version written in `.nvmrc` (with nvm: `nvm install`).
3. Install GNU gettext. The checks need its `msgfmt` to validate the
   translations:

   | System | Command |
   | --- | --- |
   | macOS | `brew install gettext` (if `msgfmt` is still not found, run `brew link gettext` and make sure `$(brew --prefix)/bin` is in your PATH) |
   | Debian/Ubuntu | `sudo apt-get install gettext` |
   | Fedora | `sudo dnf install gettext` |
   | Arch | `sudo pacman -S gettext` |
   | Windows | `winget install --id mlocati.GetText --exact`, or `choco install gettext`, or the installer from [gettext-iconv-windows](https://github.com/mlocati/gettext-iconv-windows/releases); then add its `bin` folder to the PATH that Git Bash sees |

   The check prints this same list when `msgfmt` is missing.

4. Run `npm install` in the clone. Besides the dependencies, it installs the
   git hooks (`grunt setupDevEnv`).
5. `npm start` runs Icestudio from the source.

## What the hooks check

- **pre-commit**: the data files you stage (JSON syntax, board and plugin
  files, translations), then Prettier formats the code and JSHint lints it.
- **pre-merge-commit**: the data files a merge brings.
- **pre-push**: every data file of each branch you push.

The hooks find `node` through nvm, Homebrew, Volta or fnm when a graphical
git client does not have it in its PATH. If none of them has it, the hook
stops with `node not found`: run git from a terminal where `node` works.

To run the data check by hand:

```sh
npm run checkData                    # the whole working tree
node scripts/checkData.js --staged   # what the next commit would carry
```

`npm run jshint` and `npx prettier --check .` run the other two checks.

## Pull requests

Open them against the `develop` branch. Every pull request runs
**Checks for PRs** (`.github/workflows/prettier-pr.yml`): the data check,
Prettier and JSHint. The build workflows and `grunt dist` run the data check
too before they package anything.

## When a check fails

- **Data check**: it prints `path:line:column: error: message` (for a `.po`
  file the line comes from msgfmt). Fix the file, `git add` it and commit
  again. In a rejected merge, fix and run `git commit` to conclude it; in a
  rejected push, fix it in a new commit.
- **JSHint**: fix the reported lines and commit again.
- **Prettier** in the pull request: run `npx prettier --write <files>` on the
  files it lists and push the result.

Do not skip the hooks with `--no-verify`: the pull request runs the same
checks and rejects what they would have caught.
