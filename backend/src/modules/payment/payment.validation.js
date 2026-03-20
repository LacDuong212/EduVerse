import mongoose from "mongoose";
import { z } from "zod";
import { PAYMENT_METHOD_ENUM } from "#modules/order/order.model.js";

export const createPaymentRequest = z.object({
  body: z.object({
    orderId: z.string("Order ID is required").trim()
      .min(1, "Order ID cannot be empty")
      .pipe(
        z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
          message: "Invalid order ID format",
        })
      ),
    paymentMethod: z.string("Payment method is required")
      .trim()
      .min(1, "Payment method cannot be empty")
      .pipe(
        z.enum(PAYMENT_METHOD_ENUM.values(), "Payment method not supported")
      ),
  }),
});