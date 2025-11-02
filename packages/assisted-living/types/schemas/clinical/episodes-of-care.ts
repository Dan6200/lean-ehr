import { z } from 'zod'
import { EpisodeStatusTypeEnum } from '@/types/enums'
import { CodeableConceptSchema } from '../codeable-concept'
import { PeriodSchema } from '.'

export const EpisodesOfCareSchema = z.object({
  id: z.string(),
  resident_id: z.string(),
  status: EpisodeStatusTypeEnum,
  type: CodeableConceptSchema,
  period: PeriodSchema,
  managing_organization: z.string(),
})
