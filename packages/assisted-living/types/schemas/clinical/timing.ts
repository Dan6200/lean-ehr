import { z } from 'zod'
import { RepeatSchema } from './repeat'
import { CodeableConceptSchema } from '../codeable-concept'

export const TimingSchema = z.object({
  code: CodeableConceptSchema,
  repeat: RepeatSchema,
})
