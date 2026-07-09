#!/usr/bin/env node
// rgcodelab CLI — fetch RG Codelab Claude Code skills as plain folders (no git history).
//
// Usage:
//   npx rgcodelab install-skill <skill-name>     drop the skill into ./.claude/skills/<name>
//   npx rgcodelab list                           list available skills
//   npx rgcodelab help                           show this help
//
// `install-skill` shallow-clones the source repo, copies ONLY the named skill's
// folder into your current project's `.claude/skills/<name>/`, then deletes the
// clone. The result is plain files — no .git, no plugin install, no marketplace.

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
const https = require("https");

// GitHub repo that hosts the skills. Change if you move/rename the repo.
const REPO = "rajivgogia/poc";
const BRANCH = "master";
// Each skill lives in the repo at:
//   <SKILLS_BASE>/<skillName>/skills/<skillName>/   (the Claude "skill" folder)
const SKILLS_BASE = "ClaudeCode/POCs/1. Github-self-package/plugins";

function hasGit() {
  try {
    execSync("git --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function skillRepoPath(skillName) {
  return `${SKILLS_BASE}/${skillName}/skills/${skillName}`;
}

// Recursive, cross-platform directory copy (files only, no symlinks).
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else if (entry.isFile()) {
      fs.copyFileSync(s, d);
    }
  }
}

function cloneSkill(skillName, tmp) {
  const url = `https://github.com/${REPO}.git`;
  const sub = skillRepoPath(skillName);
  // Try the efficient path first: blobless + sparse, materialize only the skill folder.
  try {
    execSync(
      `git clone --depth 1 --branch ${BRANCH} --filter=blob:none --sparse "${url}" "${tmp}"`,
      { stdio: "inherit" }
    );
    execSync(`git -C "${tmp}" sparse-checkout set "${sub}"`, { stdio: "inherit" });
  } catch {
    // Fallback for older git: plain shallow clone of the whole repo.
    execSync(`git clone --depth 1 --branch ${BRANCH} "${url}" "${tmp}"`, {
      stdio: "inherit",
    });
  }
  return path.join(tmp, sub);
}

function installSkill(skillName) {
  if (!skillName) {
    console.error("Usage: npx rgcodelab install-skill <skill-name>");
    process.exit(1);
  }
  if (!hasGit()) {
    console.error('Error: "git" was not found on your PATH. Install git first.');
    process.exit(1);
  }

  const dest = path.resolve(process.cwd(), ".claude/skills", skillName);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rgcodelab-"));

  try {
    console.log(`Fetching skill "${skillName}" from github.com/${REPO} (${BRANCH}) ...`);
    const src = cloneSkill(skillName, tmp);

    if (!fs.existsSync(src)) {
      console.error(`Error: skill "${skillName}" was not found in the repo.`);
      console.error(`  looked for: ${skillRepoPath(skillName)}`);
      console.error(`  browse: https://github.com/${REPO}/tree/${BRANCH}/${SKILLS_BASE}`);
      process.exit(1);
    }

    fs.mkdirSync(path.dirname(dest), { recursive: true });
    copyDir(src, dest);

    console.log(`\n✓ Installed skill "${skillName}" to ${dest}`);
    console.log("It is project-scoped (lives in this project's .claude/skills/).");
    console.log('Run "/reload" or restart Claude Code, then invoke with:');
    console.log(`  /${skillName}`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

// List skills by reading the repo's <SKILLS_BASE> folder via the GitHub API.
function listSkills() {
  const apiPath =
    "/repos/" +
    REPO +
    "/contents/" +
    SKILLS_BASE.split("/").map(encodeURIComponent).join("/") +
    `?ref=${encodeURIComponent(BRANCH)}`;
  const opts = { hostname: "api.github.com", path: apiPath, headers: { "User-Agent": "rgcodelab-cli" } };
  https
    .get(opts, (res) => {
      let body = "";
      res.on("data", (c) => (body += c));
      res.on("end", () => {
        if (res.statusCode !== 200) {
          console.error(`Error: could not list skills (HTTP ${res.statusCode}).`);
          console.error(`Browse: https://github.com/${REPO}/tree/${BRANCH}/${SKILLS_BASE}`);
          process.exit(1);
        }
        let entries = [];
        try {
          entries = JSON.parse(body);
        } catch {
          console.error("Error: unexpected response from GitHub API.");
          process.exit(1);
        }
        const skills = entries
          .filter((e) => e.type === "dir")
          .map((e) => e.name)
          .sort();
        if (!skills.length) {
          console.log("No skills found.");
        } else {
          console.log("Available skills:");
          for (const s of skills) console.log(`  - ${s}`);
        }
        console.log(`\nInstall with: npx rgcodelab install-skill <name>`);
        console.log(`Browse: https://github.com/${REPO}/tree/${BRANCH}/${SKILLS_BASE}`);
      });
    })
    .on("error", (e) => {
      console.error(`Error: ${e.message}`);
      process.exit(1);
    });
}

function help() {
  console.log(`rgcodelab — fetch RG Codelab Claude Code skills as plain folders

Usage:
  npx rgcodelab install-skill <skill-name>   Fetch a skill into ./.claude/skills/<name>
  npx rgcodelab list                          List available skills
  npx rgcodelab help                          Show this help

install-skill copies only the skill folder (SKILL.md + supporting files) into
your current project's .claude/skills/. No git history, no plugin install.

Source: https://github.com/${REPO}/tree/${BRANCH}/${SKILLS_BASE}`);
}

function main() {
  const args = process.argv.slice(2);
  // Strip the optional --claude/-c flag (kept for compatibility; this CLI no
  // longer uses the plugin marketplace, so it is purely a no-op convention).
  const filtered = args.filter((a) => a !== "--claude" && a !== "-c");
  const sub = filtered[0];

  switch (sub) {
    case "install-skill":
      installSkill(filtered[1]);
      break;
    case "list":
      listSkills();
      break;
    case undefined:
    case "help":
    case "--help":
    case "-h":
      help();
      break;
    default:
      console.error(`Unknown command: ${sub}`);
      help();
      process.exit(1);
  }
}

main();