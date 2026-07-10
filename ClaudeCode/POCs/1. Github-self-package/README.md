# rgcodelab

Install Claude Code skills from the rgcodelab collection with one command — **no git clone, no git history**. `npx` fetches the package, the CLI copies the skill into your local `~/.claude/skills` directory.

## Usage

Install a skill into Claude Code:

```bash
npx rgcodelab install-skill dev-team-lead --claude
```

Overwrite an existing install:

```bash
npx rgcodelab install-skill dev-team-lead --claude --force
```

List skills bundled in the package:

```bash
npx rgcodelab list
```

Help:

```bash
npx rgcodelab help
```

## What it does

`install-skill <name> --claude` copies the bundled `<name>` skill (shipped inside this package under `.claude/skills/<name>`) into `~/.claude/skills/<name>` on your machine. Because the skill ships inside the npm package, your machine never touches git — there is no clone step and no `.git` directory left behind.

After installing, restart Claude Code (or run `/reload`) so the new skill is picked up.

## Available skills

| Skill | Description |
|-------|-------------|
| `dev-team-lead` | Acts as Tech Lead orchestrating a full AI dev pod to plan, build, test, and ship features end-to-end. |

## Publishing (maintainers)

From the package directory:

```bash
npm pack --dry-run     # verify only intended files are included
npm publish            # you must be logged in: npm whoami
```

The published payload is locked down with the `files` allowlist in `package.json` plus `.npmignore`, so only the CLI and the bundled skills ship — no `superpowers`, no `.git`, no `node_modules`.

## Requirements

Node.js 18+. No runtime dependencies.