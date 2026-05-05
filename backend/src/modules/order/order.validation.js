import mongoose from "mongoose";
import { z } from "zod";
import { courseIdSchema } from "#modules/course/course.validation.js";
import { STATUS_ENUM, PAYMENT_METHOD_ENUM } from "./order.model.js";

export const orderIdSchema = z.string("Order ID is required")
  .trim()
  .min(1, "Order ID cannot be empty")
  .pipe(
    z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "Invalid order ID format",
    })
  );

export const paymentMethodSchema = z.string("Payment method is required")
  .trim()
  .min(1, "Payment method cannot be empty")
  .pipe(
    z.enum(PAYMENT_METHOD_ENUM.values(), {
      error: "Payment method not supported"
    })
  );

export const orderIdParamsRequest = z.object({
  params: z.object({
    id: orderIdSchema,
  }),
});

export const createOrderRequest = z.object({
  body: z.object({
    selectedCourseIds: z
      .array(courseIdSchema, "Selected courses must be a list")
      .min(1, "You must select at least one course")
      .max(50, "You cannot checkout more than 50 courses at once"),
    paymentMethod: paymentMethodSchema,
    couponCode: z
      .string("Invalid coupon code")
      .trim()
      .min(1, "Coupon code, if provided, cannot be blank")
      .max(100, "Coupon code is too long")
      .optional()
      .nullable(),
  }, "Please provide enough data to create an order"),
});

export const ordersQueryRequest = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(20).optional().default(8),
    search: z.string().trim().optional().default(""),
    sort: z
      .enum(["newest", "oldest", "totalAsc", "totalDesc", "statusAsc", "statusDesc"])
      .optional()
      .default("newest"),
    status: z
      .enum([
        STATUS_ENUM.pending,
        STATUS_ENUM.completed,
        STATUS_ENUM.cancelled,
        STATUS_ENUM.refunded,
      ])
      .optional(),
  }),
});

export const orderIdParam = z.object({
  params: z.object({
    orderId: z.string().min(1, "Order ID is required"),
  }),
});