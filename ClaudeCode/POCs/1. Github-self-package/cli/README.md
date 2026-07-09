# rgcodelab CLI

A small npm CLI that installs RG Codelab Claude Code skills/plugins. It's a thin convenience wrapper over the official `claude plugin` commands — the marketplace repo is the source of truth.

## Usage

```bash
npx rgcodelab install-skill dev-team-lead --claude
npx rgcodelab list
npx rgcodelab help
```

`--claude` is an optional convention flag (ignored — this CLI always targets Claude Code).

## What it does

`install-skill <name>` runs:

1. `claude plugin marketplace add rajivgogia/poc` — registers/refreshes the marketplace.
2. `claude plugin install <name>@rgcodelab` — installs the plugin to user scope.

Then run `/reload-plugins` (or restart Claude Code) and invoke with `/<name>:<name>`.

## Requirements

- Node.js >= 18
- `claude` (Claude Code CLI) on your `PATH`

## Configuration

If you rename or move the marketplace repo, update `MARKETPLACE_REPO` and `MARKETPLACE_NAME` in `bin/rgcodelab.js`.

## Publish

```bash
cd cli
npm publish
```