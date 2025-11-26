import { registerTask } from "../utils/scheduler.js"
import { removeManyObjects } from "../utils/aws/deleteObject.js";

import DraftVideo from "../models/draftVideoModel.js";
import Order from "../models/orderModel.js";

// AUTO RUN CRON JOBS ---

// run every hour at minute 0
registerTask("Cleanup Draft Videos", "0 * * * *", async () => {
  const now = new Date();

  // find expired drafts
  // limit to 100 to prevent memory spikes if huge backlog exists. 
  // the next hour's run will catch the rest.
  const expiredDrafts = await DraftVideo.find({ 
    expireAt: { $lte: now } 
  }).limit(100);

  if (expiredDrafts.length === 0) return;

  console.log(`>> Cleanup Draft Videos: Found ${expiredDrafts.length} expired videos, starting cleanup...`);

  // prepare data
  const s3Keys = expiredDrafts.map(doc => doc.key);
  const docIds = expiredDrafts.map(doc => doc._id);

  // delete from S3 first (cost saving: prevent orphans)
  const s3Result = await removeManyObjects(s3Keys);

  // delete from db
  // delete from db regardless of s3Result.success to avoid an infinite loop 
  // of trying to delete files that might already be gone or erroring.
  if (s3Result.success || s3Result.deletedCount > 0) {
    const dbResult = await DraftVideo.deleteMany({ _id: { $in: docIds } });
    console.log(`>> Cleanup Draft Videos: Removed ${dbResult.deletedCount} records from DB.`);
  } else {
    console.error(`>> Cleanup Draft Videos: S3 deletion failed, skipping DB delete to retry later.`);
  }
});

// run every minute
registerTask("Expire Orders", "* * * * *", async () => {
  const now = new Date();

  // find orders that are pending AND past their expiration time
  // limit 50 to prevent database locking if there's a huge backlog
  const expiredOrders = await Order.find({
    status: "pending",
    expiresAt: { $lte: now }
  }).select('_id')  // we only need the ID
  .limit(50);

  if (expiredOrders.length === 0) return;

  const orderIds = expiredOrders.map(o => o._id);

  try {
    // bulk update status to 'cancelled'
    const result = await Order.updateMany(
      { _id: { $in: orderIds } },
      {
        $set: {
          status: "cancelled"
        }
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`>> Expire Orders: Expired ${result.modifiedCount} orders: [${orderIds.join(", ")}]`);
    }

  } catch (error) {
    console.error(">> Expire Orders: Error expiring orders: ", error);
  }
});
