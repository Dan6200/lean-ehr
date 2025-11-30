import { z } from 'zod'
import { TimingSchema } from './timing'
import { DoseAndRateSchema } from './dose'
import { CodeableConceptSchema } from '../codeable-concept'

export const DosageInstructionSchema = z.object({
  timing: TimingSchema,
  site: CodeableConceptSchema,
  route: CodeableConceptSchema,
  method: CodeableConceptSchema,
  dose_and_rate: z.array(DoseAndRateSchema),
})
