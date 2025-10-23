export type Nullable<T> = T | null | undefined

import { z } from 'zod'

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

export const LegalRelationshipEnum = z.enum([
  'HCP_AGENT_DURABLE',
  'POA_FINANCIAL',
  'GUARDIAN_OF_PERSON',
  'GUARDIAN_OF_ESTATE',
  'TRUSTEE',
])

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

export const FinancialTransactionTypeEnum = z.enum([
  'CHARGE',
  'PAYMENT',
  'ADJUSTMENT',
])

// --- Plaintext Schemas (for Application Use) ---

const SnomedConceptSchema = z.object({
  name: z.string(),
  snomed_code: z.string(),
})

const StrengthSchema = z.object({
  value: z.number(),
  unit: z.string(),
})

const MedicationSchema = z.object({
  rxnorm_code: z.string(),
  snomed_code: z.string(),
  name: z.string(),
  strength: StrengthSchema,
})

const DoseAndRateSchema = z.object({
  doseQuantity: StrengthSchema,
})

const DosageInstructionSchema = z.object({
  timing: z.string(),
  site: SnomedConceptSchema,
  route: SnomedConceptSchema,
  method: SnomedConceptSchema,
  doseAndRate: z.array(DoseAndRateSchema),
})

export const AllergySchema = z.object({
  resident_id: z.string(),
  recorder_id: z.string(),
  clinicalStatus: AllergyClinicalStatusEnum,
  verificationStatus: AllergyVerificationStatusEnum,
  type: AllergyTypeEnum,
  recordedDate: z.string(),
  substance: SnomedConceptSchema,
  reaction: z.object({
    code: z.string(),
    name: z.string(),
    severity: z.string(),
  }),
})

export const PrescriptionSchema = z.object({
  resident_id: z.string(),
  recorder_id: z.string(),
  effective_period_start: z.string(),
  effective_period_end: z.string(),
  status: PrescriptionStatusEnum,
  adherence: PrescriptionAdherenceStatusEnum,
  medication: MedicationSchema,
  dosageInstruction: z.array(DosageInstructionSchema),
})

export const ObservationSchema = z.object({
  resident_id: z.string(),
  recorder_id: z.string(),
  status: ObservationStatusEnum,
  effective_datetime: z.string(),
  loinc_code: z.string(),
  name: z.string(),
  value: z.number(),
  unit: z.string(),
  body_site: SnomedConceptSchema,
  method: SnomedConceptSchema,
  device: z.object({ name: z.string(), udi_code: z.string() }),
})

export const DiagnosticHistorySchema = z.object({
  resident_id: z.string(),
  recorder_id: z.string(),
  clinicalStatus: ConditionStatusEnum,
  recordedDate: z.string(),
  onsetDateTime: z.string(),
  abatementDateTime: z.string().nullable(),
  title: z.string(),
  snomed_code: z.string(),
})

export const EmarRecordSchema = z.object({
  resident_id: z.string(),
  prescription_id: z.string(),
  medication: MedicationSchema,
  recorder_id: z.string(),
  status: AdministrationStatusEnum,
  effective_datetime: z.string(),
  dosage: z.object({
    route: SnomedConceptSchema,
    administeredDose: StrengthSchema,
  }),
})

export const FinancialTransactionSchema = z.object({
  resident_id: z.string(),
  amount: z.number(),
  occurrence_datetime: z.string(),
  type: FinancialTransactionTypeEnum,
  description: z.string(),
})

export const EmergencyContactSchema = z
  .object({
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
      ...(data.legal_relationships || []),
      ...(data.personal_relationships || []),
    ],
  }))

export const ResidentSchema = z.object({
  resident_name: z.string().nullable().optional(),
  gender: z.string().optional(),
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

// --- Encrypted Field Schema ---
export const EncryptedFieldSchema = z.object({
  ciphertext: z.string(),
  iv: z.string(),
  authTag: z.string(),
})

// --- Encrypted Schemas (for Firestore Storage) ---

export const EncryptedAllergySchema = z.object({
  encrypted_dek: z.string(),
  encrypted_clinicalStatus: EncryptedFieldSchema,
  encrypted_verificationStatus: EncryptedFieldSchema,
  encrypted_type: EncryptedFieldSchema,
  encrypted_recordedDate: EncryptedFieldSchema,
  encrypted_substance: EncryptedFieldSchema,
  encrypted_reaction: EncryptedFieldSchema,
})

export const EncryptedPrescriptionSchema = z.object({
  encrypted_dek: z.string(),
  encrypted_effective_period_start: EncryptedFieldSchema,
  encrypted_effective_period_end: EncryptedFieldSchema,
  encrypted_status: EncryptedFieldSchema,
  encrypted_adherence: EncryptedFieldSchema,
  encrypted_medication: EncryptedFieldSchema,
  encrypted_dosageInstruction: EncryptedFieldSchema,
})

export const EncryptedObservationSchema = z.object({
  encrypted_dek: z.string(),
  encrypted_status: EncryptedFieldSchema,
  encrypted_effective_datetime: EncryptedFieldSchema,
  encrypted_loinc_code: EncryptedFieldSchema,
  encrypted_name: EncryptedFieldSchema,
  encrypted_value: EncryptedFieldSchema,
  encrypted_unit: EncryptedFieldSchema,
  encrypted_body_site: EncryptedFieldSchema,
  encrypted_method: EncryptedFieldSchema,
  encrypted_device: EncryptedFieldSchema,
})

export const EncryptedDiagnosticHistorySchema = z.object({
  encrypted_dek: z.string(),
  encrypted_clinicalStatus: EncryptedFieldSchema,
  encrypted_recordedDate: EncryptedFieldSchema,
  encrypted_onsetDateTime: EncryptedFieldSchema,
  encrypted_abatementDateTime: EncryptedFieldSchema.nullable(),
  encrypted_title: EncryptedFieldSchema,
  encrypted_snomed_code: EncryptedFieldSchema,
})

export const EncryptedEmarRecordSchema = z.object({
  encrypted_dek: z.string(),
  encrypted_medication: EncryptedFieldSchema,
  encrypted_status: EncryptedFieldSchema,
  encrypted_effective_datetime: EncryptedFieldSchema,
  encrypted_dosage: EncryptedFieldSchema,
})

export const EncryptedFinancialTransactionSchema = z.object({
  encrypted_dek: z.string(),
  encrypted_amount: EncryptedFieldSchema,
  encrypted_occurrence_datetime: EncryptedFieldSchema,
  encrypted_type: EncryptedFieldSchema,
  encrypted_description: EncryptedFieldSchema,
})

export const EncryptedEmergencyContactSchema = z.object({
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
export type FinancialTransaction = z.infer<typeof FinancialTransactionSchema>
export type EmergencyContact = z.infer<typeof EmergencyContactSchema>
export type Resident = z.infer<typeof ResidentSchema>
export type EmarRecord = z.infer<typeof EmarRecordSchema>

// --- Other Schemas & Types (unchanged) ---
export const FacilitySchema = z.object({
  id: z.string().optional(),
  address: z.string(),
})
export type Facility = z.infer<typeof FacilitySchema>

export const LeanResidentDataSchema = ResidentSchema.extend({
  id: z.string().optional(),
  address: z.string(),
})
export type LeanResidentData = z.infer<typeof LeanResidentDataSchema>

export const ResidentDataSchema = ResidentSchema.extend({
  id: z.string().optional(),
  address: z.string(),
  allergies: z.array(AllergySchema),
  prescriptions: z.array(PrescriptionSchema),
  observations: z.array(ObservationSchema),
  diagnostic_history: z.array(DiagnosticHistorySchema),
  emergency_contacts: z.array(EmergencyContactSchema),
  financials: z.array(FinancialTransactionSchema),
  emar: z.array(EmarRecordSchema),
})
export type ResidentData = z.infer<typeof ResidentDataSchema>
