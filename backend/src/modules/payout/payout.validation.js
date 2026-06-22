import { z } from "zod";
import { pageSchema, limitSchema } from "#utils/pagination.js";

export const requestPayoutRequest = z.object({
  body: z.object({
    bankName:      z.string().min(1, "Bank name is required").max(100),
    accountNumber: z.string().min(1, "Account number is required").max(50),
    accountName:   z.string().min(1, "Account name is required").max(100),
    periodLabel:   z.string().max(20).optional(),
  }),
});

export const listPayoutsRequest = z.object({
  query: z.object({
    page:   pageSchema,
    limit:  limitSchema(),
    status: z.enum(["pending", "approved", "paid", "rejected"]).optional(),
  }),
});

export const payoutIdParamRequest = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const updatePayoutStatusRequest = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    status:    z.enum(["paid", "rejected"]),
    adminNote: z.string().max(500).optional(),
  }),
});
