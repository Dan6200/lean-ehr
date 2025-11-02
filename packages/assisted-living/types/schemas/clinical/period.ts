import { z } from 'zod'

export const PeriodSchema = z.object({
  start: z.string(),
  end: z.string(),
})
