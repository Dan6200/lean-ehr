import { z } from 'zod'

export const StrengthSchema = z.object({
  value: z.number(),
  unit: z.string(),
})
