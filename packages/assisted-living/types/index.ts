export type Nullable<T> = T | null | undefined

import { z } from 'zod'
import {
  decryptAllergy,
  decryptDiagnosticHistory,
  decryptEmarRecord,
  decryptEmergencyContact,
  decryptFinancialTransaction,
  decryptObservation,
  decryptPrescription,
  getAllergiesConverter,
  getDiagnosticHistoryConverter,
  getEmarRecordConverter,
  getEmergencyContactsConverter,
  getFinancialsConverter,
  getObservationsConverter,
  getPrescriptionsConverter,
} from './converters'

// --- Enums ---
export const ObservationStatusEnum = z.enum([
  'registered',
  'preliminary',
  'final',
  'amended',
  'corrected',
  'cancelled',
  'entered-in-error',
  'unknown',
])

export const AllergyClinicalStatusEnum = z.enum([
  'active',
  'inactive',
  'resolved',
])

export const AllergyVerificationStatusEnum = z.enum([
  'unconfirmed',
  'presumed',
  'confirmed',
  'refuted',
  'entered-in-error',
])

export const AllergyTypeEnum = z.enum(['allergy', 'intolerance'])
export const ConditionStatusEnum = z.enum([
  'active',
  'recurrence',
  'remission',
  'resolved',
])

export const CarePlanGoalStatusEnum = z.enum([
  'proposed',
  'planned',
  'accepted',
  'active',
  'on-hold',
  'completed',
  'cancelled',
  'entered-in-error',
  'rejected',
])

export const PrescriptionStatusEnum = z.enum([
  'recorded',
  'entered-in-error',
  'draft',
])

export const PrescriptionAdherenceStatusEnum = z.enum([
  'taking',
  'taking-as-directed',
  'taking-not-as-directed',
  'not-taking',
  'on-hold',
  'on-hold-as-directed',
  'on-hold-not-as-directed',
  'stopped',
  'stopped-as-directed',
  'stopped-not-as-directed',
  'unknown',
])

export const AdministrationStatusEnum = z.enum([
  'in-progress',
  'not-done',
  'on-hold',
  'completed',
  'entered-in-error',
  'stopped',
  'unknown',
])

export const ClaimStatusEnum = z
  .enum(['draft', 'submitted', 'adjudicated', 'paid'])
  .default('draft')

export const LegalRelationshipEnum = z.enum([
  'HCP_AGENT_DURABLE',
  'POA_FINANCIAL',
  'GUARDIAN_OF_PERSON',
  'GUARDIAN_OF_ESTATE',
  'TRUSTEE',
])

export const CoverageStatusEnum = z
  .enum(['active', 'cancelled', 'draft', 'entered-in-error'])
  .default('active')

export const PersonalRelationshipEnum = z.enum([
  'SPOUSE',
  'DOMESTIC_PARTNER',
  'PARENT',
  'CHILD',
  'SIBLING',
  'EMERGENCY_CONTACT',
  'CARETAKER',
  'FRIEND',
  'OTHER_RELATIVE',
])

export const RelationshipEnum = z.union([
  LegalRelationshipEnum,
  PersonalRelationshipEnum,
])

// Deprecated...
// export const FinancialTransactionTypeEnum = z.enum([
//   'CHARGE',
//   'PAYMENT',
//   'ADJUSTMENT',
// ])

export const EpisodeStatusTypeEnum = z.enum([
  'active',
  'finished',
  'cancelled',
  'waitlist',
])

export const CarePlanStatusTypeEnum = z.enum([
  'draft',
  'active',
  'on-hold',
  'completed',
  'revoked',
  'entered-in-error',
  'ended',
  'unknown',
])

// -- Codeable Concepts --
const CodingSchema = z.object({
  system: z.string().url(), // or regex for known systems
  code: z.string(),
  display: z.string().optional(),
})

const CodeableConceptSchema = z.object({
  coding: z.array(CodingSchema),
  text: z.string().optional(),
})

const SnomedSystem = z.literal('http://snomed.info/sct')
const RxNormSystem = z.literal('http://snomed.info/sct')

const SnomedCodingSchema = z.object({
  system: SnomedSystem,
  code: z.string(),
  display: z.string().optional(),
})

const SnomedConceptSchema = z.object({
  coding: z.array(SnomedCodingSchema),
  text: z.string().optional(),
})

const MedicationCodingSchema = z.object({
  system: z.union([SnomedSystem, RxNormSystem]),
  code: z.string(),
  display: z.string().optional(),
})

const MedicationConceptSchema = z.object({
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

const CarePlanGoalConceptSchema = z.object({
  coding: z.array(CarePlanGoalCodingSchema),
  text: z.string().optional(),
})

// --- Plaintext Schemas (for Application Use) ---

const StrengthSchema = z.object({
  value: z.number(),
  unit: z.string(),
})

const MedicationSchema = z.object({
  code: MedicationConceptSchema,
  strength: StrengthSchema,
})

const DoseAndRateSchema = z.object({
  dose_quantity: StrengthSchema,
})

const ValueQuantitySchema = z.object({
  value: z.number(),
  unit: z.string(),
  system: z.string().url(),
  code: z.string(),
})

const RepeatSchema = z.object({
  frequency: z.number(),
  period: z.number(),
  period_unit: z.string(),
  time_of_day: z.array(z.string()),
})

const TimingSchema = z.object({
  code: CodeableConceptSchema,
  repeat: RepeatSchema,
})

const PeriodSchema = z.object({
  start: z.string(),
  end: z.string(),
})

const DosageInstructionSchema = z.object({
  timing: TimingSchema,
  site: CodeableConceptSchema,
  route: CodeableConceptSchema,
  method: CodeableConceptSchema,
  dose_and_rate: z.array(DoseAndRateSchema),
})

const CarePlanGoalSchema = z.object({
  lifecycle_status: CarePlanGoalStatusEnum,
  category: z.string(), // TODO: create fhir category type
  priority: z.string(),
  description: z.object({
    code: CarePlanGoalConceptSchema,
  }),
})

const CarePlanActivitySchema = z.object({
  id: z.string(),
  code: CodeableConceptSchema,
  status: z.string(),
  timing: TimingSchema,
  staff_instructions: z.string(),
})

export const AllergySchema = z
  .object({
    id: z.string(),
    resident_id: z.string(),
    recorder_id: z.string(),
    clinical_status: AllergyClinicalStatusEnum,
    verification_status: AllergyVerificationStatusEnum,
    type: AllergyTypeEnum,
    name: CodeableConceptSchema,
    recorded_date: z.string(),
    substance: CodeableConceptSchema,
    reaction: z.object({
      code: CodeableConceptSchema,
      severity: z.string(),
    }),
  })
  .optional()

export const PrescriptionSchema = z
  .object({
    id: z.string(),
    resident_id: z.string(),
    recorder_id: z.string(),
    period: PeriodSchema,
    status: PrescriptionStatusEnum,
    adherence: PrescriptionAdherenceStatusEnum,
    medication: MedicationSchema,
    dosage_instruction: z.array(DosageInstructionSchema),
  })
  .optional()

export const ObservationSchema = z
  .object({
    id: z.string(),
    resident_id: z.string(),
    recorder_id: z.string(),
    status: ObservationStatusEnum,
    category: z.array(CodeableConceptSchema),
    code: CodeableConceptSchema,
    effective_datetime: z.string(),
    value_quantity: ValueQuantitySchema,
    body_site: CodeableConceptSchema,
    method: CodeableConceptSchema,
    device: CodeableConceptSchema,
  })
  .optional()

export const DiagnosticHistorySchema = z
  .object({
    id: z.string(),
    resident_id: z.string(),
    recorder_id: z.string(),
    clinical_status: ConditionStatusEnum,
    recorded_date: z.string(),
    onset_datetime: z.string(),
    abatement_datetime: z.string().nullable().optional(),
    title: z.string(),
    // code: CodeableConceptSchema, -- for now embed directly...
    CodeableConceptSchema,
  })
  .optional()

export const EmarRecordSchema = z
  .object({
    id: z.string(),
    resident_id: z.string(),
    prescription_id: z.string(),
    medication: MedicationSchema,
    recorder_id: z.string(),
    status: AdministrationStatusEnum,
    effective_datetime: z.string(),
    dosage: z.object({
      route: CodeableConceptSchema,
      administered_dose: StrengthSchema,
    }),
  })
  .optional()

// Deprecated, leave here for reference...
// export const FinancialTransactionSchema = z.object({
//   id: z.string(),
//   resident_id: z.string(),
//   amount: z.number(),
//   occurrence_datetime: z.string(),
//   type: FinancialTransactionTypeEnum,
//   description: z.string(),
// })

export const ChargeSchema = z.object({
  id: z.string(),
  service: z.string(),
  code: z.string().nullable().optional(),
  quantity: z.number().default(1),
  unit_price: z.number(),
  currency: z.string().default('NGN'),
  occurrence_datetime: z.string(),
  description: z.string().optional(),
})

export const ClaimSchema = z.object({
  id: z.string(),
  created: z.string(),
  status: ClaimStatusEnum,
  coverage_id: z.string().nullable().optional(),
  charges: z.array(z.string()).default([]), // IDs of charges
  total: z.number(),
  currency: z.string().default('NGN'),
  description: z.string().optional(),
})

export const CoverageSchema = z.object({
  id: z.string(),
  status: CoverageStatusEnum,
  type: z.string().optional(), // e.g. "NHIS", "Private Insurance", "Self-pay"
  beneficiary_id: z.string(), // resident_id
  // The organization or individual responsible for paying
  payor: z.object({
    id: z.string(),
    organization: z.string().nullable(), // Null if id is resident_id
  }),
  // Coverage period
  period: z
    .object({
      start: z.string().optional(), // ISO date
      end: z.string().optional(),
    })
    .optional(),

  // Optional policy identifiers
  policy_number: z.string().nullable().optional(),
  plan_name: z.string().nullable().optional(),

  // Relationships or classifications (e.g. dependent, spouse, worker)
  relationship: z.string().optional(), // "self" | "dependent" | "child" | etc.

  // Coverage level (optional)
  class: z
    .array(
      z.object({
        type: z.string().optional(), // e.g. "plan" | "group"
        value: z.string(),
        name: z.string().optional(),
      }),
    )
    .optional(),

  // Financial details (optional)
  network: z.string().optional(),
  cost_to_beneficiary: z.number().nullable().optional(),

  // Metadata
  created_at: z.string(),
  updated_at: z.string().optional(),
})

export const AdjustmentSchema = z.object({
  id: z.string(),
  claim_id: z.string(),
  reason: z.string(),
  approved_amount: z.number(),
  coverage_id: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
})

export const PaymentSchema = z.object({
  id: z.string(),
  claim_id: z.string().nullable().optional(),
  coverage_id: z.string().nullable().optional(),
  amount: z.number(),
  currency: z.string().default('NGN'),
  payor: z.string(), // could reference org or program
  occurrence_datetime: z.string(),
  method: z.string().optional(), // e.g. "EFT", "cash", "check"
})

export const EpisodesOfCareSchema = z.object({
  id: z.string(),
  resident_id: z.string(),
  status: EpisodeStatusTypeEnum,
  type: CodeableConceptSchema,
  period: PeriodSchema,
  managing_organization: z.string(),
})

export const CarePlanSchema = z.object({
  id: z.string(),
  resident_id: z.string(),
  status: CarePlanStatusTypeEnum,
  title: z.string(),
  author_id: z.string(),
  created_date: z.string(),
  goals: z.array(CarePlanGoalSchema),
  activites: z.array(CarePlanActivitySchema),
})

export const EmergencyContactSchema = z
  .object({
    id: z.string(),
    resident_id: z.string(),
    contact_name: z.string().nullable().optional(),
    cell_phone: z.string(),
    work_phone: z.string().nullable().optional(),
    home_phone: z.string().nullable().optional(),
    relationship: z.array(RelationshipEnum).nullable().optional(),
    legal_relationships: z.array(LegalRelationshipEnum).nullable().optional(),
    personal_relationships: z
      .array(PersonalRelationshipEnum)
      .nullable()
      .optional(),
  })
  .transform((data) => ({
    ...data,
    relationship: [
      ...(data.relationship || []),
      ...(data.legal_relationships || []),
      ...(data.personal_relationships || []),
    ],
  }))

// Resident base record
export const ResidentSchema = z.object({
  resident_code: z.string().optional(),
  resident_name: z.string().nullable().optional(),
  gender: z.string().optional(),
  address_1: z.string(),
  address_2: z.string().optional(),
  facility_id: z.string(),
  room_no: z.string(),
  avatar_url: z.string(),
  dob: z.string(),
  pcp: z.string(),
  resident_email: z.string().nullable().optional(),
  cell_phone: z.string().nullable().optional(),
  work_phone: z.string().nullable().optional(),
  home_phone: z.string().nullable().optional(),
})

export const IdentifierSchema = z.object({
  id: z.string(),
  system: z.string(),
  value: z.string(),
  type: z.string().optional(),
  issued: z.string().optional(),
})

// --- Encrypted Field Schema ---
export const EncryptedFieldSchema = z.object({
  ciphertext: z.string(),
  iv: z.string(),
  authTag: z.string(),
})

// --- Encrypted Schemas (for Firestore Storage) ---

export const EncryptedAllergySchema = z.object({
  resident_id: z.string(),
  recorder_id: z.string(),
  encrypted_dek: z.string(),
  encrypted_name: EncryptedFieldSchema,
  encrypted_clinical_status: EncryptedFieldSchema,
  encrypted_verification_status: EncryptedFieldSchema,
  encrypted_type: EncryptedFieldSchema,
  encrypted_recorded_date: EncryptedFieldSchema,
  encrypted_substance: EncryptedFieldSchema,
  encrypted_reaction: EncryptedFieldSchema,
})

export const EncryptedPrescriptionSchema = z.object({
  resident_id: z.string(),
  recorder_id: z.string(),
  encrypted_dek: z.string(),
  encrypted_period: EncryptedFieldSchema,
  encrypted_status: EncryptedFieldSchema,
  encrypted_adherence: EncryptedFieldSchema,
  encrypted_medication: EncryptedFieldSchema,
  encrypted_dosage_instruction: EncryptedFieldSchema,
})

export const EncryptedObservationSchema = z.object({
  resident_id: z.string(),
  recorder_id: z.string(),
  encrypted_dek: z.string(),
  encrypted_status: EncryptedFieldSchema,
  encrypted_category: EncryptedFieldSchema,
  encrypted_code: EncryptedFieldSchema,
  encrypted_value_quantity: EncryptedFieldSchema,
  encrypted_effective_datetime: EncryptedFieldSchema,
  encrypted_body_site: EncryptedFieldSchema,
  encrypted_method: EncryptedFieldSchema,
  encrypted_device: EncryptedFieldSchema,
})

export const EncryptedDiagnosticHistorySchema = z.object({
  resident_id: z.string(),
  recorder_id: z.string(),
  encrypted_dek: z.string(),
  encrypted_clinical_status: EncryptedFieldSchema,
  encrypted_recorded_date: EncryptedFieldSchema,
  encrypted_onset_datetime: EncryptedFieldSchema,
  encrypted_abatement_datetime: EncryptedFieldSchema.nullable(),
  encrypted_title: EncryptedFieldSchema,
  encrypted_coding: EncryptedFieldSchema,
})

export const EncryptedEmarRecordSchema = z.object({
  resident_id: z.string(),
  recorder_id: z.string(),
  prescription_id: z.string(),
  encrypted_dek: z.string(),
  encrypted_medication: EncryptedFieldSchema,
  encrypted_status: EncryptedFieldSchema,
  encrypted_effective_datetime: EncryptedFieldSchema,
  encrypted_dosage: EncryptedFieldSchema,
})

export const EncryptedFinancialTransactionSchema = z.object({
  resident_id: z.string(),
  encrypted_dek: z.string(),
  encrypted_amount: EncryptedFieldSchema,
  encrypted_occurrence_datetime: EncryptedFieldSchema,
  encrypted_type: EncryptedFieldSchema,
  encrypted_description: EncryptedFieldSchema,
})

export const EncryptedCarePlanSchema = z.object({
  resident_id: z.string(),
  encrypted_dek: z.string(),
  encrypted_status: EncryptedFieldSchema,
  encrypted_title: EncryptedFieldSchema,
  encrypted_author_id: EncryptedFieldSchema,
  encrypted_created_date: EncryptedFieldSchema,
  encrypted_goals: EncryptedFieldSchema,
  encrypted_activites: EncryptedFieldSchema,
})

export const EncryptedEpisodesOfCareSchema = z.object({
  resident_id: z.string(),
  encrypted_dek: z.string(),
  encrypted_status: EncryptedFieldSchema,
  encrypted_type: EncryptedFieldSchema,
  encrypted_period_start: EncryptedFieldSchema,
  encrypted_managing_organization: EncryptedFieldSchema,
})

export const EncryptedEmergencyContactSchema = z.object({
  resident_id: z.string(),
  encrypted_dek: z.string(),
  encrypted_contact_name: EncryptedFieldSchema.nullable().optional(),
  encrypted_cell_phone: EncryptedFieldSchema,
  encrypted_work_phone: EncryptedFieldSchema.nullable().optional(),
  encrypted_home_phone: EncryptedFieldSchema.nullable().optional(),
  encrypted_relationship: EncryptedFieldSchema.nullable().optional(),
})

export const EncryptedResidentSchema = z.object({
  // Unencrypted fields
  facility_id: z.string(),

  // Encrypted DEKs
  encrypted_dek_general: z.string(),
  encrypted_dek_contact: z.string(),
  encrypted_dek_clinical: z.string(),
  encrypted_dek_financial: z.string(),

  // Encrypted data fields
  encrypted_avatar_url: EncryptedFieldSchema.nullable().optional(),
  encrypted_gender: EncryptedFieldSchema.nullable().optional(),
  encrypted_resident_name: EncryptedFieldSchema.nullable().optional(),
  encrypted_dob: EncryptedFieldSchema.nullable().optional(),
  encrypted_pcp: EncryptedFieldSchema.nullable().optional(),
  encrypted_room_no: EncryptedFieldSchema.nullable().optional(),
  encrypted_resident_email: EncryptedFieldSchema.nullable().optional(),
  encrypted_cell_phone: EncryptedFieldSchema.nullable().optional(),
  encrypted_work_phone: EncryptedFieldSchema.nullable().optional(),
  encrypted_home_phone: EncryptedFieldSchema.nullable().optional(),
})

// --- Types ---
export type Observation = z.infer<typeof ObservationSchema>
export type DiagnosticHistory = z.infer<typeof DiagnosticHistorySchema>
export type Allergy = z.infer<typeof AllergySchema>
export type Prescription = z.infer<typeof PrescriptionSchema>
// export type FinancialTransaction = z.infer<typeof FinancialTransactionSchema>
export type EmergencyContact = z.infer<typeof EmergencyContactSchema>
export type Resident = z.infer<typeof ResidentSchema>
export type EmarRecord = z.infer<typeof EmarRecordSchema>

// --- Other Schemas & Types (unchanged) ---
export const FacilitySchema = z.object({
  id: z.string().optional(),
  address: z.string(),
})
export type Facility = z.infer<typeof FacilitySchema>

export const ResidentDataSchema = ResidentSchema.extend({
  id: z.string().optional(),
  address: z.string(),
  // financials: FinancialTransactionSchema.array().optional(),
  emergency_contacts: EmergencyContactSchema.array().optional(),
  allergies: AllergySchema.array().optional(),
  prescriptions: PrescriptionSchema.array().optional(),
  observations: ObservationSchema.array().optional(),
  diagnostic_history: DiagnosticHistorySchema.array().optional(),
  emar: EmarRecordSchema.array().optional(),
})

export type ResidentData = z.infer<typeof ResidentDataSchema>

export type SubCollectionMapType = {
  emergency_contacts: {
    converter: typeof getEmergencyContactsConverter
    decryptor: typeof decryptEmergencyContact
    schema: typeof EmergencyContactSchema
    encrypted_schema: typeof EncryptedEmergencyContactSchema
  }
  financials: {
    converter: typeof getFinancialsConverter
    decryptor: typeof decryptFinancialTransaction
    encrypted_schema: typeof EncryptedFinancialTransactionSchema
    // schema: typeof FinancialTransactionSchema
  }
  allergies: {
    converter: typeof getAllergiesConverter
    decryptor: typeof decryptAllergy
    encrypted_schema: typeof EncryptedAllergySchema
    schema: typeof AllergySchema
  }
  prescriptions: {
    converter: typeof getPrescriptionsConverter
    decryptor: typeof decryptPrescription
    encrypted_schema: typeof EncryptedPrescriptionSchema
    schema: typeof PrescriptionSchema
  }
  observations: {
    converter: typeof getObservationsConverter
    decryptor: typeof decryptObservation
    encrypted_schema: typeof EncryptedObservationSchema
    schema: typeof ObservationSchema
  }
  diagnostic_history: {
    converter: typeof getDiagnosticHistoryConverter
    decryptor: typeof decryptDiagnosticHistory
    encrypted_schema: typeof EncryptedDiagnosticHistorySchema
    schema: typeof DiagnosticHistorySchema
  }
  emar: {
    converter: typeof getEmarRecordConverter
    decryptor: typeof decryptEmarRecord
    encrypted_schema: typeof EncryptedEmarRecordSchema
    schema: typeof EmarRecordSchema
  }
}

export const subCollectionMap: SubCollectionMapType = {
  allergies: {
    converter: getAllergiesConverter,
    decryptor: decryptAllergy,
    encrypted_schema: EncryptedAllergySchema,
    schema: AllergySchema,
  },
  prescriptions: {
    converter: getPrescriptionsConverter,
    decryptor: decryptPrescription,
    encrypted_schema: EncryptedPrescriptionSchema,
    schema: PrescriptionSchema,
  },
  observations: {
    converter: getObservationsConverter,
    decryptor: decryptObservation,
    encrypted_schema: EncryptedObservationSchema,
    schema: ObservationSchema,
  },
  diagnostic_history: {
    converter: getDiagnosticHistoryConverter,
    decryptor: decryptDiagnosticHistory,
    encrypted_schema: EncryptedDiagnosticHistorySchema,
    schema: DiagnosticHistorySchema,
  },
  emergency_contacts: {
    converter: getEmergencyContactsConverter,
    decryptor: decryptEmergencyContact,
    schema: EmergencyContactSchema,
    encrypted_schema: EncryptedEmergencyContactSchema,
  },
  financials: {
    converter: getFinancialsConverter,
    decryptor: decryptFinancialTransaction,
    // schema: FinancialTransactionSchema,
    encrypted_schema: EncryptedFinancialTransactionSchema,
  },
  emar: {
    converter: getEmarRecordConverter,
    decryptor: decryptEmarRecord,
    encrypted_schema: EncryptedEmarRecordSchema,
    schema: EmarRecordSchema,
  },
} as const

export type SubCollectionKey = keyof typeof subCollectionMap

export type SubCollectionArgs<K extends keyof SubCollectionMapType> =
  SubCollectionMapType[K]
// 1. Define the final expected type using your Mapped Type (which is now correct)
export type AllCollectionData = {
  [P in keyof SubCollectionMapType]: z.infer<
    SubCollectionMapType[P]['schema']
  >[]
}
