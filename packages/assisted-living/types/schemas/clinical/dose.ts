import { z } from 'zod'
import { StrengthSchema } from './strength'

export const DoseAndRateSchema = z.object({
  dose_quantity: StrengthSchema,
})
