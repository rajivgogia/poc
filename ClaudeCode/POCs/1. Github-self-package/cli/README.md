# rgcodelab CLI

A small npm CLI that fetches RG Codelab Claude Code **skills as plain folders** — no git history, no plugin install, no marketplace. It shallow-clones the source repo, copies only the requested skill into your current project's `.claude/skills/<name>/`, then deletes the clone.

## Usage

```bash
npx rgcodelab install-skill dev-team-lead
npx rgcodelab list
npx rgcodelab help
```

`--claude` is still accepted as an optional no-op flag for backward compatibility (it does nothing now).

## What `install-skill <name>` does

1. Shallow-clones `rajivgogia/poc` (master) to a temp dir — efficient: blobless + sparse, falling back to a plain shallow clone on older git.
2. Copies only `<SKILLS_BASE>/<name>/skills/<name>/` (the `SKILL.md` + supporting files) into `./.claude/skills/<name>/`.
3. Deletes the temp clone.

The result is plain files in your project — **no `.git`, no plugin install, no marketplace registration**. Then run `/reload` (or restart Claude Code) and invoke with `/<name>`.

## Requirements

- Node.js >= 18
- `git` on your `PATH`

## Configuration

If you rename/move the repo or the skills folder, update `REPO`, `BRANCH`, and `SKILLS_BASE` in `bin/rgcodelab.js`.

## Publish

```bash
cd cli
npm publish
```