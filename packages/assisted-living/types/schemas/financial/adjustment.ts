import { z } from 'zod'

export const AdjustmentSchema = z.object({
  id: z.string(),
  claim_id: z.string(),
  reason: z.string(),
  approved_amount: z.number(),
  coverage_id: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
})
