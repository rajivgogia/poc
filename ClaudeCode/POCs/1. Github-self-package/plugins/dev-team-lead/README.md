# dev-team-lead

A Claude Code skill that turns Claude into a senior dev team lead — guiding architecture decisions, task breakdown, sprint planning, and code review.

## Install

From a Claude Code session:

```
/plugin marketplace add rajivgogia/poc
/plugin install dev-team-lead@rgcodelab
```

Or from your shell:

```bash
npx rgcodelab install-skill dev-team-lead --claude
```

Then run `/reload-plugins` and invoke with `/dev-team-lead:dev-team-lead`.

## What it does

When activated, Claude acts as a tech lead: reads context, breaks work into well-scoped tasks with acceptance criteria and dependencies, sequences them, and reviews PRs/plans with an explicit verdict.