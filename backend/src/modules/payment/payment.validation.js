import { z } from "zod";
import { orderIdSchema, paymentMethodSchema }
  from "#modules/order/order.validation.js";

export const createPaymentRequest = z.object({
  body: z.object({
    orderId: orderIdSchema,
    paymentMethod: paymentMethodSchema,
  }, "Order info is equired to set up payment"),
});