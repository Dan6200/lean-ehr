import { z } from 'zod'
import { CarePlanGoalStatusEnum } from '@/types/enums'
import { CarePlanGoalConceptSchema } from '../codeable-concept'

export const CarePlanGoalSchema = z.object({
  careplan_id: z.string(),
  lifecycle_status: CarePlanGoalStatusEnum,
  category: z.string(), // TODO: create fhir category type
  priority: z.string(),
  description: z.object({
    code: CarePlanGoalConceptSchema,
  }),
})
