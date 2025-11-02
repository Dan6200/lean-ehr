import { z } from 'zod'
import { TimingSchema } from '.'
import { SnomedConceptSchema } from '../codeable-concept'

export const CarePlanActivitySchema = z.object({
  id: z.string(),
  careplan_id: z.string(),
  code: SnomedConceptSchema,
  status: z.string(),
  timing: TimingSchema,
  staff_instructions: z.string(),
})
