import { z } from 'zod'

export const ValueQuantitySchema = z.object({
  value: z.number(),
  unit: z.string(),
  system: z.string().url(),
  code: z.string(),
})
