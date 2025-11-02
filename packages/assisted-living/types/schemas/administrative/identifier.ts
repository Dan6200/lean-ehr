import { z } from 'zod'

export const IdentifierSchema = z.object({
  id: z.string(),
  system: z.string(),
  value: z.string(),
  type: z.string().optional(),
  issued: z.string().optional(),
})
