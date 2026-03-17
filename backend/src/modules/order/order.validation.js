import mongoose from "mongoose";
import { z } from "zod";
import { PAYMENT_METHOD_ENUM } from "./order.model.js";

const orderIdSchema = z.string({ error: "Order ID is required" }).trim()
  .min(1, "Order ID cannot be empty")
  .pipe(
    z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "Invalid order ID format",
    })
  );

export const orderIdParamsSchema = z.object({
  params: z.object({
    id: orderIdSchema,
  }),
});

export const createOrderSchema = z.object({
  body: z.object({
    selectedCourseIds: z
      .array(
        z.string({ error: "Course ID is required" })
          .trim()
          .min(1, "Course ID cannot be empty")
          .pipe(
            z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
              message: "Invalid course ID format",
            })
          ),
        { error: "Selected courses must be a list" }
      )
      .min(1, "You must select at least one course")
      .max(50, "You cannot checkout more than 50 courses at once"),
    paymentMethod: z.string({ error: "Payment method is required" })
      .trim()
      .min(1, "Payment method cannot be empty")
      .pipe(
        z.enum(PAYMENT_METHOD_ENUM.values(), {
          error: "Payment method not supported"
        })
      ),
    couponCode: z
      .string({ error: "Invalid coupon code" })
      .trim()
      .min(1, "Coupon code, if provided, cannot be blank")
      .max(100, "Coupon code is too long")
      .optional()
      .nullable(),
  }),
});