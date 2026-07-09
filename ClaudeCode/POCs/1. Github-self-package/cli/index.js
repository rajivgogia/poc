#!/usr/bin/env node
'use strict';

// rgcodelabs — install Claude Code skills from the rgcodelabs collection.
//
//   npx rgcodelabs install-skill dev-team-lead            → ./dev-team-lead/   (just files)
//   npx rgcodelabs install-skill dev-team-lead --claude   → ~/.claude/skills/ (opt-in)
//
// By default the skill files are copied into the current working directory so
// they stay as plain files on disk — they are NOT installed into Claude. Use
// --claude to instead install into ~/.claude/skills, where Claude Code will
// auto-discover the skill.
//
// The skill files are bundled inside this package (under .claude/skills) so the
// consumer never has to git-clone anything: npx fetches the package, this bin
// runs, and the skill is copied out. No git clone, no git history.

const fs = require('fs');
const path = require('path');
const os = require('os');

const PKG_ROOT = path.join(__dirname, '..');
const SKILLS_SRC_DIR = path.join(PKG_ROOT, '.claude', 'skills');

const HELP = `rgcodelabs — install Claude Code skills from the rgcodelabs collection.

Usage:
  rgcodelabs install-skill <skill> [--claude] [--force]   Download a skill
  rgcodelabs list                                          List skills bundled in this package
  rgcodelabs help                                          Show this help

By default the skill is copied into the current directory as ./<skill>/ — it is
NOT installed into Claude. Pass --claude to install it into ~/.claude/skills,
where Claude Code auto-discovers it.

Examples:
  npx rgcodelabs install-skill dev-team-lead                 → ./dev-team-lead/
  npx rgcodelabs install-skill dev-team-lead --claude        → ~/.claude/skills/dev-team-lead/
  npx rgcodelabs install-skill dev-team-lead --force         overwrite ./dev-team-lead/

Options:
  --claude   Install into Claude Code (~/.claude/skills) instead of the current dir.
  --force    Overwrite an existing skill directory without prompting.
  -h, --help Show this help.

The skill is copied from the bundled package — no git clone, no git history.
`;

function fail(msg, code = 1) {
  console.error(`error: ${msg}`);
  process.exit(code);
}

// Recursively copy a directory. Overwrites existing files. Creates dest as needed.
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else if (entry.isSymbolicLink()) {
      // Resolve and copy the link target rather than copying a dangling link.
      const real = fs.realpathSync(s);
      const stat = fs.lstatSync(real);
      if (stat.isDirectory()) copyDir(real, d);
      else fs.copyFileSync(real, d);
    } else if (entry.isFile()) {
      fs.copyFileSync(s, d);
    }
  }
}

// Recursively remove a directory if it exists.
function rmrf(target) {
  if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });
}

// Discover skill names bundled in this package. Excludes the vendored
// 'superpowers' set — only user-authored skills are published.
function availableSkills() {
  if (!fs.existsSync(SKILLS_SRC_DIR)) return [];
  return fs
    .readdirSync(SKILLS_SRC_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name !== 'superpowers')
    .map((e) => e.name)
    .sort();
}

// Resolve the parent directory the skill will be copied into.
//   'local'  → current working directory (default; skill lands in ./<skill>/, not in Claude)
//   'claude' → ~/.claude/skills (opt-in; Claude Code auto-discovers the skill here)
function targetDir(flag) {
  if (flag === 'local') return process.cwd();
  if (flag === 'claude') return path.join(os.homedir(), '.claude', 'skills');
  fail(`unknown target '--${flag}'. Supported targets: --claude.`);
}

function installSkill(skill, opts) {
  if (!skill) fail('missing skill name. Try: rgcodelabs list');

  const src = path.join(SKILLS_SRC_DIR, skill);
  if (!fs.existsSync(src) || !fs.statSync(src).isDirectory()) {
    const known = availableSkills();
    fail(
      `skill '${skill}' is not bundled in this package.` +
        (known.length ? ` Available: ${known.join(', ')}` : ' No skills found in the package.')
    );
  }

  if (!opts.target) opts.target = 'local'; // default: copy into the current directory, not into Claude

  const destParent = targetDir(opts.target);
  const dest = path.join(destParent, skill);

  if (fs.existsSync(dest)) {
    if (!opts.force) {
      console.error(
        `A skill named '${skill}' already exists at:\n  ${dest}\n` +
          `Use --force to overwrite it.`
      );
      process.exit(1);
    }
    rmrf(dest);
  }

  fs.mkdirSync(destParent, { recursive: true });
  copyDir(src, dest);

  const fileCount = countFiles(dest);
  console.log(
    `\n✓ Installed skill '${skill}' → ${dest}\n  ${fileCount} file(s) copied. No git history.\n`
  );
  if (opts.target === 'claude') {
    console.log(`Restart Claude Code (or /reload) to pick up the new skill.`);
  } else {
    console.log(`Files only — not installed into Claude. Use --claude to install into ~/.claude/skills.`);
  }
}

function countFiles(dir) {
  let n = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) n += countFiles(p);
    else if (entry.isFile()) n += 1;
  }
  return n;
}

function listSkills() {
  const skills = availableSkills();
  if (!skills.length) {
    console.log('No skills are bundled in this package.');
    return;
  }
  console.log('Bundled skills (install with: rgcodelabs install-skill <name>):\n');
  for (const name of skills) {
    const skillMd = path.join(SKILLS_SRC_DIR, name, 'SKILL.md');
    let desc = '';
    if (fs.existsSync(skillMd)) desc = extractDescription(skillMd);
    console.log(`  ${name}${desc ? `  — ${desc}` : ''}`);
  }
}

// Pull the `description:` field from a SKILL.md frontmatter for a friendlier list.
// Handles both `description: value` and block scalars like `description: >\n  ...`.
function extractDescription(file) {
  try {
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
    // Isolate frontmatter between the first two `---` fences.
    if (!lines.length || lines[0].trim() !== '---') return '';
    const fm = [];
    for (let i = 1; i < lines.length && lines[i].trim() !== '---'; i++) fm.push(lines[i]);
    const idx = fm.findIndex((l) => /^description:\s*/.test(l));
    if (idx === -1) return '';
    const inline = fm[idx].replace(/^description:\s*/, '').trim();
    // Inline value (no block scalar).
    if (inline && inline !== '>' && inline !== '|') {
      return inline.length > 80 ? inline.slice(0, 77) + '...' : inline;
    }
    // Block scalar: collect following indented lines as the value.
    const parts = [];
    for (let j = idx + 1; j < fm.length; j++) {
      if (/^\S/.test(fm[j])) break; // first non-indented line ends the block
      parts.push(fm[j].trim());
    }
    const raw = parts.join(' ').replace(/\s+/g, ' ').trim();
    return raw.length > 80 ? raw.slice(0, 77) + '...' : raw;
  } catch {
    return '';
  }
}

function main(argv) {
  const args = argv.slice(2);

  if (args.length === 0 || args.includes('-h') || args.includes('--help') || args[0] === 'help') {
    console.log(HELP);
    return;
  }

  const command = args[0];
  const rest = args.slice(1);

  if (command === 'list' || (command === 'install-skill' && rest.includes('--list'))) {
    listSkills();
    return;
  }

  if (command !== 'install-skill') {
    fail(`unknown command '${command}'. Try: rgcodelabs help`);
  }

  const opts = { target: null, force: false };
  let skill = null;
  for (const a of rest) {
    if (a === '--claude') opts.target = 'claude';
    else if (a === '--force' || a === '-f') opts.force = true;
    else if (a.startsWith('--')) fail(`unknown option '${a}'. Try: rgcodelabs help`);
    else if (a === '-h' || a === '--help') {
      console.log(HELP);
      return;
    } else if (!skill) skill = a;
    else fail(`unexpected argument '${a}'. Only one skill name is expected.`);
  }

  installSkill(skill, opts);
}

main(process.argv);