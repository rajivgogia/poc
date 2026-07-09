#!/usr/bin/env node
// rgcodelab CLI — install RG Codelab Claude Code skills/plugins.
//
// Usage:
//   npx rgcodelab install-skill <skill-name> --claude
//   npx rgcodelab list

const { execSync } = require("child_process");

// The git repo hosting the plugin marketplace (GitHub owner/repo).
// Change this if you rename the repo or move it.
const MARKETPLACE_REPO = "rajivgogia/poc";
const MARKETPLACE_NAME = "rgcodelab";

function run(cmd) {
  console.log(`$ ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

function tryRun(cmd) {
  try {
    execSync(cmd, { stdio: "inherit" });
    return true;
  } catch {
    return false;
  }
}

function hasClaude() {
  try {
    execSync("claude --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function installSkill(skillName) {
  if (!skillName) {
    console.error('Usage: npx rgcodelab install-skill <skill-name> --claude');
    process.exit(1);
  }
  if (!hasClaude()) {
    console.error('Error: "claude" was not found on your PATH.');
    console.error('Install Claude Code first: https://claude.com/claude-code');
    process.exit(1);
  }

  console.log(`Adding marketplace "${MARKETPLACE_NAME}" from ${MARKETPLACE_REPO} ...`);
  // Re-adding an existing marketplace is safe; it updates/refreshes it.
  run(`claude plugin marketplace add ${MARKETPLACE_REPO}`);

  console.log(`\nInstalling skill "${skillName}" ...`);
  run(`claude plugin install ${skillName}@${MARKETPLACE_NAME}`);

  console.log(`\n✓ Installed ${skillName}@${MARKETPLACE_NAME}.`);
  console.log('Run "/reload-plugins" (or restart Claude Code), then invoke with:');
  console.log(`  /${skillName}:${skillName}`);
}

function listSkills() {
  if (!hasClaude()) {
    console.error('Error: "claude" was not found on your PATH.');
    process.exit(1);
  }
  // Refresh the catalog then list available plugins from this marketplace.
  tryRun(`claude plugin marketplace add ${MARKETPLACE_REPO}`);
  run(`claude plugin marketplace list`);
  console.log(`\nBrowse available skills at: https://github.com/${MARKETPLACE_REPO}`);
}

function help() {
  console.log(`rgcodelab — install RG Codelab Claude Code skills

Usage:
  npx rgcodelab install-skill <skill-name> --claude   Install a skill/plugin
  npx rgcodelab list                                  List available skills
  npx rgcodelab help                                   Show this help

Marketplace: ${MARKETPLACE_NAME} (https://github.com/${MARKETPLACE_REPO})`);
}

function main() {
  const args = process.argv.slice(2);
  // Strip the optional --claude flag (convention only; this CLI targets Claude Code).
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