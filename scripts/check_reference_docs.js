#!/usr/bin/env node
/**
 * Verifies that "living reference" paths still exist on disk.
 * Does not prove content matches the repo — that requires the Change-to-Doc Matrix
 * in .cursor/rules/05-update-docs.mdc before merge.
 *
 * Run: npm run verify-reference-docs
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

/** Keep in sync with `.cursor/rules/05-update-docs.mdc` → Living Reference Pages */
const LIVING_REFERENCE_FILES = [
  "README.md",
  "knowledge/llms.txt",
  ".cursor/rules/01-repo-standards.mdc",
  ".cursor/rules/04-folder-integrity.mdc",
  ".cursor/rules/05-update-docs.mdc",
  ".cursor/rules/create-agent.mdc",
  "requirements/features/core-system-architecture.md",
  "scripts/README.md",
  "docs/CONTRIBUTING.md",
];

function main() {
  const missing = [];
  for (const rel of LIVING_REFERENCE_FILES) {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) {
      missing.push(rel);
    }
  }

  if (missing.length > 0) {
    console.error("Missing living reference file(s):");
    for (const m of missing) {
      console.error(`  - ${m}`);
    }
    console.error(
      "\nFix paths or update the registry in scripts/check_reference_docs.js and 05-update-docs.mdc.",
    );
    process.exit(1);
  }

  console.log(
    `OK: ${LIVING_REFERENCE_FILES.length} living reference paths exist.`,
  );
  console.log(
    "Reminder: content must still match the Change-to-Doc Matrix in .cursor/rules/05-update-docs.mdc before you finish.",
  );
}

main();
