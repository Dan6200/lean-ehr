import { z } from 'zod'
import { ClaimStatusEnum } from '@/types/enums'

export const ClaimSchema = z.object({
  id: z.string(),
  created: z.string(),
  status: ClaimStatusEnum,
  coverage_id: z.string().nullable().optional(),
  charges: z.array(z.string()).default([]), // IDs of charges
  total: z.number(),
  currency: z.string().default('NGN'),
  description: z.string().optional(),
})
