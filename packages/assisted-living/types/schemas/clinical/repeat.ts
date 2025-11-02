import { z } from 'zod'

export const RepeatSchema = z.object({
  frequency: z.number(),
  period: z.number(),
  period_unit: z.string(),
  time_of_day: z.array(z.string()),
})
