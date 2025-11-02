import { z } from 'zod'
import {
  AllergySchema,
  DiagnosticHistorySchema,
  EmarRecordSchema,
  EmergencyContactSchema,
  FinancialTransactionSchema,
  ObservationSchema,
  PrescriptionSchema,
} from './schemas'
import {
  EncryptedAllergySchema,
  EncryptedDiagnosticHistorySchema,
  EncryptedEmarRecordSchema,
  EncryptedEmergencyContactSchema,
  EncryptedFinancialTransactionSchema,
  EncryptedObservationSchema,
  EncryptedPrescriptionSchema,
} from './encrypted-schemas'
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
    schema: typeof FinancialTransactionSchema
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
    schema: FinancialTransactionSchema,
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

export type AllCollectionData = {
  [P in keyof SubCollectionMapType]: z.infer<
    SubCollectionMapType[P]['schema']
  >[]
}
