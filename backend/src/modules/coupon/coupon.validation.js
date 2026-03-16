import { z } from "zod"

export const applyCouponSchema = z.object({
    body: z.object({
        code: z.string()
        .trim()
        .min(3, "COupon code is required"),

        originalPrice: z.number({
            required_error: "Original price is required"
        }).min(0, "Price must be >= 0")
    })
});