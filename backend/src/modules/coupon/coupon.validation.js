import { z } from "zod"

export const applyCouponRequest = z.object({
  body: z.object({
    code: z.string("Coupon code is required")
      .trim()
      .min(3, "Invalid coupon code"),
    originalPrice: z.number("Original price is required")
      .min(0, "Price must be >= 0")
  })
});