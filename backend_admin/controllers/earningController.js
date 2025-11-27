import Order from "../models/orderModel.js";


export const getEarningsHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;

    const skip = (page - 1) * limit;

    const matchStage = {};

    const results = await Order.aggregate([
      { $unwind: "$courses" },

      {
        $lookup: {
          from: "courses",
          localField: "courses.course",
          foreignField: "_id",
          as: "courseDetails",
        },
      },

      { $unwind: "$courseDetails" },

      { $match: matchStage },

      { $sort: { createdAt: -1 } },

      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: "$_id",
                name: "$courseDetails.title",
                date: "$createdAt",
                amount: "$courses.pricePaid",
                status: "$status",
                paymentMethod: {
                  $switch: {
                    branches: [
                      {
                        case: { $eq: ["$paymentMethod", "momo"] },
                        then: { type: "momo", image: "/payment/momo.svg" }
                      },
                      {
                        case: { $eq: ["$paymentMethod", "vnpay"] },
                        then: { type: "vnpay", image: "/payment/vnpay.svg" }
                      }
                    ],
                    default: { type: "unknown", image: "" }
                  }
                }
              }
            }
          ],
          pagination: [
            { $count: "total" }
          ]
        }
      }
    ]);

    const data = results[0].data;
    const totalItems = results[0].pagination[0] ? results[0].pagination[0].total : 0;
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      success: true,
      data: data,
      pagination: {
        total: totalItems,
        page: page,
        totalPages: totalPages,
        limit: limit
      }
    });

  } catch (error) {
    console.error("Error fetching earnings history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch earnings history",
      error: error.message,
    });
  }
};

export const getEarningsStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $facet: {
          completed: [
            { $match: { status: "completed" } },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: "$totalAmount" },
                totalOrders: { $sum: 1 },
              },
            },
          ],
          pending: [
            { $match: { status: "pending" } },
            {
              $group: {
                _id: null,
                pendingRevenue: { $sum: "$totalAmount" },
              },
            },
          ],
          cancelled: [
            { $match: { status: "cancelled" } },
            {
              $group: {
                _id: null,
                cancelledOrders: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    const completedData = stats[0].completed[0] || { totalRevenue: 0, totalOrders: 0 };
    const pendingData = stats[0].pending[0] || { pendingRevenue: 0 };
    const cancelledData = stats[0].cancelled[0] || { cancelledOrders: 0 };

    const earningsCardsData = [
      {
        title: "Total Sales",
        amount: completedData.totalRevenue,
        variant: "success",
        isInfo: false,
      },
      {
        title: "Pending Revenue",
        amount: pendingData.pendingRevenue,
        variant: "orange",
        isInfo: false,
      },
      {
        title: "Completed Orders",
        amount: completedData.totalOrders,
        variant: "primary",
        isInfo: false,
      },
      {
        title: "Cancelled Orders",
        amount: cancelledData.cancelledOrders,
        variant: "danger",
        isInfo: false,
      },
    ];

    res.json({
      success: true,
      data: earningsCardsData,
    });

  } catch (error) {
    console.error("Error fetching earnings stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch earnings stats",
      error: error.message,
    });
  }
};
