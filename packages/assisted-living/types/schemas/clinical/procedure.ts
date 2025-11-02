import { z } from 'zod'
import { SnomedConceptSchema } from '../codeable-concept'

export const ProcedureSchema = z.object({
  id: z.string(),
  resident_id: z.string(),
  careplan_id: z.string().optional(),
  encounter_id: z.string().optional(),

  code: SnomedConceptSchema,

  status: z
    .enum([
      'preparation',
      'in-progress',
      'completed',
      'stopped',
      'entered-in-error',
    ])
    .default('completed'),

  category: z.string().optional(), // e.g. "nursing", "therapy"
  performed_start: z.string().optional(),
  performed_end: z.string().optional(),

  performer_id: z.string().optional(),
  performer_name: z.string().optional(),

  notes: z.string().optional(),
  outcome: z.string().optional(), // summary text like "No complications"
  recorded_at: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  viewed_at: z.string(),
})
