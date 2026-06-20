/**
 * Retroactive badge award — CLI runner.
 *
 * Usage (from backend/ directory):
 *   node --import ./src/register-aliases.js scripts/retroactive-badges.js
 *   node --import ./src/register-aliases.js scripts/retroactive-badges.js --dry-run
 */

import "../src/config/database.js";
import mongoose from "mongoose";

import { seedBadges } from "../src/modules/badge/badge.seed.js";
import { runRetroactiveBadges } from "../src/modules/badge/badge.retroactive.js";

const DRY_RUN = process.argv.includes("--dry-run");

async function main() {
  await seedBadges();
  await runRetroactiveBadges({ dryRun: DRY_RUN });
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  mongoose.disconnect().finally(() => process.exit(1));
});
