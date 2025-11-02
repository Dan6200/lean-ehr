import { z } from 'zod'
import { RepeatSchema } from '.'
import { CodeableConceptSchema } from '../codeable-concept'

export const TimingSchema = z.object({
  code: CodeableConceptSchema,
  repeat: RepeatSchema,
})
