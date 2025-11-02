import { z } from 'zod'

export const CodingSchema = z.object({
  system: z.string().url(), // or regex for known systems
  code: z.string(),
  display: z.string().optional(),
})

export const CodeableConceptSchema = z.object({
  coding: z.array(CodingSchema),
  text: z.string().optional(),
})

const SnomedSystem = z.literal('http://snomed.info/sct')
const RxNormSystem = z.literal('http://snomed.info/sct')
const LoincSystem = z.literal('http://snomed.info/sct')
const UCUMSystem = z.literal('http://unitsofmeasure.org')
const GUDIDSystem = z.literal('http://hl7.org/fhir/NamingSystem/gudid')

const UCUMCodingSchema = z.object({
  system: UCUMSystem,
  code: z.string(),
  display: z.string().optional(),
})

const GUDIDCodingSchema = z.object({
  system: GUDIDSystem,
  code: z.string(),
  display: z.string().optional(),
})

const LoincCodingSchema = z.object({
  system: LoincSystem,
  code: z.string(),
  display: z.string().optional(),
})

const SnomedCodingSchema = z.object({
  system: SnomedSystem,
  code: z.string(),
  display: z.string().optional(),
})

export const UCUMConceptSchema = z.object({
  coding: z.array(UCUMCodingSchema),
  text: z.string().optional(),
})

export const GUDIDConceptSchema = z.object({
  coding: z.array(GUDIDCodingSchema),
  text: z.string().optional(),
})

export const LoincConceptSchema = z.object({
  coding: z.array(LoincCodingSchema),
  text: z.string().optional(),
})

export const SnomedConceptSchema = z.object({
  coding: z.array(SnomedCodingSchema),
  text: z.string().optional(),
})

const MedicationCodingSchema = z.object({
  system: z.union([SnomedSystem, RxNormSystem]),
  code: z.string(),
  display: z.string().optional(),
})

export const MedicationConceptSchema = z.object({
  coding: z.array(MedicationCodingSchema),
  text: z.string().optional(),
})

const CarePlanGoalSystem = z.literal(
  'http://terminology.hl7.org/5.1.0/CodeSystem-goal-category.html',
)

const CarePlanGoalCodes = z.enum([
  'dietary',
  'safety',
  'behavioral',
  'nursing',
  'physiotherapy',
])

const CarePlanGoalCodingSchema = z.object({
  system: CarePlanGoalSystem,
  code: CarePlanGoalCodes,
  display: z.string().optional(),
})

export const CarePlanGoalConceptSchema = z.object({
  coding: z.array(CarePlanGoalCodingSchema),
  text: z.string().optional(),
})
