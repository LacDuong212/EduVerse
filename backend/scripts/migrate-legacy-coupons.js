/**
 * Migrate legacy coupons that stored the percentage under `discountPercent`
 * (no `discountType`/`discountValue`) to the current schema:
 *   { discountPercent: N }  ->  { discountType: 'percent', discountValue: N }  ($unset discountPercent)
 *
 * This is what caused the admin coupon list to render "undefined%".
 *
 * Usage (from backend/):
 *   node scripts/migrate-legacy-coupons.js --dry-run
 *   node scripts/migrate-legacy-coupons.js
 */
import "dotenv/config";
import connectDB from "#config/database.js";
import mongoose from "mongoose";

const DRY = process.argv.includes("--dry-run");

await connectDB();
const col = mongoose.connection.collection("coupons");

const legacy = await col.find({ discountPercent: { $exists: true }, discountValue: { $exists: false } }).toArray();
console.log(`DB: ${mongoose.connection.name}`);
console.log(`Legacy coupons to migrate: ${legacy.length}`);
for (const c of legacy) console.log(`  - ${c.code}: discountPercent=${c.discountPercent} -> discountType='percent', discountValue=${c.discountPercent}`);

if (!DRY && legacy.length) {
  const ops = legacy.map((c) => ({
    updateOne: {
      filter: { _id: c._id },
      update: {
        $set: { discountType: "percent", discountValue: Number(c.discountPercent) },
        $unset: { discountPercent: "" },
      },
    },
  }));
  const r = await col.bulkWrite(ops);
  console.log(`\n✅ Migrated ${r.modifiedCount} coupons.`);
} else if (DRY) {
  console.log("\n[DRY RUN] Nothing written.");
}

await mongoose.disconnect();
process.exit(0);
