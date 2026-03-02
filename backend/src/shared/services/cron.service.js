import DraftVideo from "#modules/draft-video/draft-video.model.js";
import Order from "#modules/order/order.model.js";
import { removeManyObjects } from "#services/s3.service.js";
import { registerTask } from "#utils/scheduler.js"

// every hour at minute 0
registerTask("Cleanup Draft Videos", "0 * * * *", async () => {
  const now = new Date();

  const expiredDrafts = await DraftVideo.find({ 
    expireAt: { $lte: now } 
  }).limit(100);

  if (expiredDrafts.length === 0) return;

  console.log(`> Cleanup Draft Videos: Found ${expiredDrafts.length} expired videos, starting cleanup...`);

  const s3Keys = expiredDrafts.map(doc => doc.key);
  const docIds = expiredDrafts.map(doc => doc._id);

  const s3Result = await removeManyObjects(s3Keys);

  if (s3Result.success || s3Result.deletedCount > 0) {
    const dbResult = await DraftVideo.deleteMany({ _id: { $in: docIds } });
    console.log(`> Cleanup Draft Videos: Removed ${dbResult.deletedCount} records from DB.`);
  } else {
    console.error(`> Cleanup Draft Videos: S3 deletion failed, skipping DB delete to retry later.`);
  }
});

// every minute
registerTask("Expire Orders", "* * * * *", async () => {
  const now = new Date();

  const expiredOrders = await Order.find({
    status: "pending",
    expiresAt: { $lte: now }
  }).select('_id')
  .limit(50);

  if (expiredOrders.length === 0) return;

  const orderIds = expiredOrders.map(o => o._id);

  try {
    const result = await Order.updateMany(
      { _id: { $in: orderIds } },
      {
        $set: {
          status: "cancelled"
        }
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`> Expire Orders: Expired ${result.modifiedCount} orders: [${orderIds.join(", ")}]`);
    }

  } catch (error) {
    console.error("> Expire Orders: Error expiring orders: ", error);
  }
});
