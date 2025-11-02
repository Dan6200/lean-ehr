import { z } from 'zod'

export const FacilitySchema = z.object({
  id: z.string().optional(),
  address: z.string(),
})
