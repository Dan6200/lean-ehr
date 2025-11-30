import { z } from 'zod'
import { MedicationConceptSchema } from '../codeable-concept'
import { StrengthSchema } from './strength'

export const MedicationSchema = z.object({
  code: MedicationConceptSchema,
  strength: StrengthSchema,
})
