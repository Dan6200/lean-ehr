import { z } from 'zod'
import { PeriodSchema } from './period'
import { SnomedConceptSchema } from '../codeable-concept'
import { TimingSchema } from './timing'

export const CarePlanActivitySchema = z.object({
  id: z.string(),
  careplan_id: z.string(),
  code: SnomedConceptSchema,
  status: z.string(),
  timing: TimingSchema,
  performer: z.object({
    id: z.string(),
    name: z.string().optional(),
    period: PeriodSchema,
  }),
  staff_instructions: z.string(),
})
