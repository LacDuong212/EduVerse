import { Router } from "express";
import { protect, restrictTo } from "#middlewares/auth.middleware.js";

import authRoute from "#modules/auth/auth.route.js";
import cartRoute from "#modules/cart/cart.route.js";
import categoryRoute from "#modules/category/category.route.js";
// import couponRoute from "#modules/coupon/coupon.route.js";
import courseRoute from "#modules/course/course.route.js";
// import chatbotRoute from "#modules/chatbot/chatbot.route.js";
import instructorRoute from "#modules/instructor/instructor.route.js";
// import internalRoute from "#modules/internal/internal.route.js";
// import notificationRoute from "#modules/notification/notification.route.js";
// import orderRoute from "#modules/order/order.route.js";
// import paymentRoute from "#modules/payment/payment.route.js";
// import quizRoute from "#modules/quiz/quiz.route.js";
// import reviewRoute from "#modules/review/review.route.js";
// import studentRoute from "#modules/student/student.route.js";
// import userRoute from "#modules/user/user.route.js";
import videoRoute from "#modules/video/video.route.js";
// import wishlistRoute from "#modules/wishlist/wishlist.route.js";

// @route /api
const apiRouter = Router();

apiRouter.use("/auth", authRoute);
apiRouter.use("/cart", cartRoute);
apiRouter.use("/categories", categoryRoute);
// apiRouter.use("/coupons", couponRoute);
apiRouter.use("/courses", courseRoute);
// apiRouter.use("/chatbot", chatbotRoute);
apiRouter.use("/instructors", instructorRoute.publicRoutes);
apiRouter.use("/instructor", protect, restrictTo("instructor"), instructorRoute.privateRoutes);
// apiRouter.use("/internal", internalRoute);
// apiRouter.use("/notifications", notificationRoute);
// apiRouter.use("/orders", orderRoute);
// apiRouter.use("/payments", paymentRoute);
// apiRouter.use("/quiz", quizRoute);
// apiRouter.use("/reviews", reviewRoute);
// apiRouter.use("/student", studentRoute);
// apiRouter.use("/user", userRoute);
apiRouter.use("/videos", videoRoute);
// apiRouter.use("/wishlist", wishlistRoute);

export default apiRouter;