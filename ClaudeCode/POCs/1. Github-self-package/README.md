# rgcodelab

A Claude Code plugin marketplace by Rajiv Gogia — a collection of skills and plugins.

## Install a skill

### Option A — native Claude Code commands (recommended)

```
/plugin marketplace add rajivgogia/poc
/plugin install dev-team-lead@rgcodelab
```

Or from the shell:

```bash
claude plugin marketplace add rajivgogia/poc
claude plugin install dev-team-lead@rgcodelab
```

### Option B — the `rgcodelab` npm CLI

```bash
npx rgcodelab install-skill dev-team-lead --claude
```

After either, run `/reload-plugins` (or restart Claude Code) and invoke the skill with:

```
/dev-team-lead:dev-team-lead
```

## Available plugins

| Plugin | Description |
| --- | --- |
| `dev-team-lead` | Architecture, planning, and review guidance from a tech lead's perspective. |

## Repo structure

```
.
├── .claude-plugin/
│   └── marketplace.json        # marketplace catalog
├── plugins/
│   └── dev-team-lead/
│       ├── .claude-plugin/
│       │   └── plugin.json     # plugin manifest
│       └── skills/
│           └── dev-team-lead/
│               └── SKILL.md    # the skill
└── cli/                        # the `rgcodelab` npm package
    ├── bin/rgcodelab.js
    └── package.json
```

## Add a new plugin

1. `mkdir -p plugins/<name>/skills/<name>`
2. Add `plugins/<name>/.claude-plugin/plugin.json` and `plugins/<name>/skills/<name>/SKILL.md`.
3. Register it in `.claude-plugin/marketplace.json` under `plugins`.
4. Validate: `claude plugin validate .`
5. Commit and push — users update with `/plugin marketplace update rgcodelab`.

## Validate

```bash
claude plugin validate .            # from repo root
claude plugin validate ./plugins/dev-team-lead --strict
```