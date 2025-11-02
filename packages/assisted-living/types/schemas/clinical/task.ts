import { z } from 'zod'

export const TaskSchema = z.object({
  id: z.string(), // UUID
  resident_id: z.string(),
  careplan_id: z.string().optional(),

  activity_code: z.string().optional(), // SNOMED, internal, etc.

  status: z
    .enum([
      'draft',
      'requested',
      'accepted',
      'in-progress',
      'completed',
      'cancelled',
      'failed',
    ])
    .default('requested'),

  intent: z
    .enum(['plan', 'order', 'original-order', 'reflex-order'])
    .default('plan'),
  priority: z.enum(['routine', 'urgent', 'asap', 'stat']).default('routine'),

  scheduled_start: z.string().optional(), // ISO datetime
  scheduled_end: z.string().optional(),

  execution_start: z.string().optional(),
  execution_end: z.string().optional(),

  performer_id: z.string().optional(),
  performer_name: z.string().optional(),

  notes: z.string().optional(),
  outcome: z.string().optional(), // "successful", "partial", etc.

  created_at: z.string(),
  updated_at: z.string(),
})
