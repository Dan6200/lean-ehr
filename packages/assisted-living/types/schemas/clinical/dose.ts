import { z } from 'zod'
import { StrengthSchema } from '.'

export const DoseAndRateSchema = z.object({
  dose_quantity: StrengthSchema,
})
