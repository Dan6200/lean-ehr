import { z } from 'zod'
import {
  PrescriptionStatusEnum,
  PrescriptionAdherenceStatusEnum,
} from '#root/types/enums'
import { PeriodSchema } from './period'
import { MedicationSchema } from './medication'
import { DosageInstructionSchema } from './dosage'

export const PrescriptionSchema = z.object({
  id: z.string(),
  resident_id: z.string(),
  recorder_id: z.string(),
  period: PeriodSchema,
  status: PrescriptionStatusEnum,
  adherence: PrescriptionAdherenceStatusEnum,
  medication: MedicationSchema,
  dosage_instruction: z.array(DosageInstructionSchema),
})
export type Prescription = z.infer<typeof PrescriptionSchema>
