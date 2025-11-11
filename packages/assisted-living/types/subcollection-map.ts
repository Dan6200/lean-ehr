import { z } from 'zod'
import {
  AllergySchema,
  DiagnosticHistorySchema,
  EmarRecordSchema,
  EmergencyContactSchema,
  AccountSchema,
  ChargeSchema,
  ClaimSchema,
  CoverageSchema,
  PaymentSchema,
  AdjustmentSchema,
  ObservationSchema,
  PrescriptionSchema,
  CarePlanSchema,
  GoalSchema,
  ProcedureSchema,
  TaskSchema,
  EncounterSchema,
  EpisodesOfCareSchema,
  IdentifierSchema,
  AddressSchema,
} from './schemas'
import {
  EncryptedAllergySchema,
  EncryptedDiagnosticHistorySchema,
  EncryptedEmarRecordSchema,
  EncryptedEmergencyContactSchema,
  EncryptedAccountSchema,
  EncryptedChargeSchema,
  EncryptedClaimSchema,
  EncryptedCoverageSchema,
  EncryptedPaymentSchema,
  EncryptedAdjustmentSchema,
  EncryptedObservationSchema,
  EncryptedPrescriptionSchema,
  EncryptedCarePlanSchema,
  EncryptedGoalSchema,
  EncryptedProcedureSchema,
  EncryptedTaskSchema,
  EncryptedEncounterSchema,
  EncryptedEpisodesOfCareSchema,
  EncryptedIdentifierSchema,
  EncryptedAddressSchema,
} from './encrypted-schemas'
import {
  // Placeholder - we will need to create these
  createConverter,
  createDecryptor,
} from './converters' // Assuming a generic creator for now

export const subCollectionMap = {
  emergency_contacts: {
    converter: () => createConverter<z.infer<typeof EmergencyContactSchema>>(),
    decryptor: createDecryptor(EncryptedEmergencyContactSchema, 'contact'),
    schema: EmergencyContactSchema,
    encrypted_schema: EncryptedEmergencyContactSchema,
  },
  accounts: {
    converter: () => createConverter<z.infer<typeof AccountSchema>>(),
    decryptor: createDecryptor(EncryptedAccountSchema, 'financial'),
    schema: AccountSchema,
    encrypted_schema: EncryptedAccountSchema,
  },
  charges: {
    converter: () => createConverter<z.infer<typeof ChargeSchema>>(),
    decryptor: createDecryptor(EncryptedChargeSchema, 'financial'),
    schema: ChargeSchema,
    encrypted_schema: EncryptedChargeSchema,
  },
  claims: {
    converter: () => createConverter<z.infer<typeof ClaimSchema>>(),
    decryptor: createDecryptor(EncryptedClaimSchema, 'financial'),
    schema: ClaimSchema,
    encrypted_schema: EncryptedClaimSchema,
  },
  coverages: {
    converter: () => createConverter<z.infer<typeof CoverageSchema>>(),
    decryptor: createDecryptor(EncryptedCoverageSchema, 'financial'),
    schema: CoverageSchema,
    encrypted_schema: EncryptedCoverageSchema,
  },
  payments: {
    converter: () => createConverter<z.infer<typeof PaymentSchema>>(),
    decryptor: createDecryptor(EncryptedPaymentSchema, 'financial'),
    schema: PaymentSchema,
    encrypted_schema: EncryptedPaymentSchema,
  },
  adjustments: {
    converter: () => createConverter<z.infer<typeof AdjustmentSchema>>(),
    decryptor: createDecryptor(EncryptedAdjustmentSchema, 'financial'),
    schema: AdjustmentSchema,
    encrypted_schema: EncryptedAdjustmentSchema,
  },
  allergies: {
    converter: () => createConverter<z.infer<typeof AllergySchema>>(),
    decryptor: createDecryptor(EncryptedAllergySchema, 'clinical'),
    schema: AllergySchema,
    encrypted_schema: EncryptedAllergySchema,
  },
  prescriptions: {
    converter: () => createConverter<z.infer<typeof PrescriptionSchema>>(),
    decryptor: createDecryptor(EncryptedPrescriptionSchema, 'clinical'),
    schema: PrescriptionSchema,
    encrypted_schema: EncryptedPrescriptionSchema,
  },
  observations: {
    converter: () => createConverter<z.infer<typeof ObservationSchema>>(),
    decryptor: createDecryptor(EncryptedObservationSchema, 'clinical'),
    schema: ObservationSchema,
    encrypted_schema: EncryptedObservationSchema,
  },
  diagnostic_history: {
    converter: () => createConverter<z.infer<typeof DiagnosticHistorySchema>>(),
    decryptor: createDecryptor(EncryptedDiagnosticHistorySchema, 'clinical'),
    schema: DiagnosticHistorySchema,
    encrypted_schema: EncryptedDiagnosticHistorySchema,
  },
  emar: {
    converter: () => createConverter<z.infer<typeof EmarRecordSchema>>(),
    decryptor: createDecryptor(EncryptedEmarRecordSchema, 'clinical'),
    schema: EmarRecordSchema,
    encrypted_schema: EncryptedEmarRecordSchema,
  },
  care_plans: {
    converter: () => createConverter<z.infer<typeof CarePlanSchema>>(),
    decryptor: createDecryptor(EncryptedCarePlanSchema, 'clinical'),
    schema: CarePlanSchema,
    encrypted_schema: EncryptedCarePlanSchema,
  },
  goals: {
    converter: () => createConverter<z.infer<typeof GoalSchema>>(),
    decryptor: createDecryptor(EncryptedGoalSchema, 'clinical'),
    schema: GoalSchema,
    encrypted_schema: EncryptedGoalSchema,
  },
  procedures: {
    converter: () => createConverter<z.infer<typeof ProcedureSchema>>(),
    decryptor: createDecryptor(EncryptedProcedureSchema, 'clinical'),
    schema: ProcedureSchema,
    encrypted_schema: EncryptedProcedureSchema,
  },
  tasks: {
    converter: () => createConverter<z.infer<typeof TaskSchema>>(),
    decryptor: createDecryptor(EncryptedTaskSchema, 'clinical'),
    schema: TaskSchema,
    encrypted_schema: EncryptedTaskSchema,
  },
  encounters: {
    converter: () => createConverter<z.infer<typeof EncounterSchema>>(),
    decryptor: createDecryptor(EncryptedEncounterSchema, 'clinical'),
    schema: EncounterSchema,
    encrypted_schema: EncryptedEncounterSchema,
  },
  episodes_of_care: {
    converter: () => createConverter<z.infer<typeof EpisodesOfCareSchema>>(),
    decryptor: createDecryptor(EncryptedEpisodesOfCareSchema, 'clinical'),
    schema: EpisodesOfCareSchema,
    encrypted_schema: EncryptedEpisodesOfCareSchema,
  },
  identifiers: {
    converter: () => createConverter<z.infer<typeof IdentifierSchema>>(),
    decryptor: createDecryptor(EncryptedIdentifierSchema, 'general'),
    schema: IdentifierSchema,
    encrypted_schema: EncryptedIdentifierSchema,
  },
  addresses: {
    converter: () => createConverter<z.infer<typeof AddressSchema>>(),
    decryptor: createDecryptor(EncryptedAddressSchema, 'contact'),
    schema: AddressSchema,
    encrypted_schema: EncryptedAddressSchema,
  },
} as const

export type SubCollectionMapType = typeof subCollectionMap

export type SubCollectionKey = keyof SubCollectionMapType

export type AllCollectionData = {
  [P in SubCollectionKey]?: z.infer<SubCollectionMapType[P]['schema']>[]
}
