'use server'
import {
  generateDataKey,
  decryptDataKey,
  encryptData,
  decryptData,
  KEK_GENERAL_PATH,
  KEK_CONTACT_PATH,
  KEK_CLINICAL_PATH,
  KEK_FINANCIAL_PATH,
} from '@/lib/encryption'

import {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
} from 'firebase/firestore'
import {
  Allergy,
  EmergencyContactSchema,
  EncryptedAllergySchema,
  EncryptedEmergencyContactSchema,
  EncryptedFinancialTransactionSchema,
  EncryptedPrescriptionSchema,
  EncryptedResident,
  EncryptedResidentSchema,
  EncryptedObservationSchema,
  EncryptedDiagnosticHistorySchema,
  Facility,
  FacilitySchema,
  FinancialTransaction,
  LegalRelationshipEnum,
  Prescription,
  Observation,
  DiagnosticHistory,
  PersonalRelationshipEnum,
  Resident,
  ResidentSchema,
  EncryptedEmarRecordSchema,
} from '.'

// --- Converters ---
const facilityConverter: FirestoreDataConverter<Facility> = {
  toFirestore(facility: Facility): DocumentData {
    return FacilitySchema.parse(facility)
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Facility {
    return FacilitySchema.parse(snapshot.data())
  },
}

export async function encryptResident(
  resident: Resident,
): Promise<EncryptedResident> {
  const dataToEncrypt: any = { ...resident }
  const encryptedData: any = {}

  encryptedData.facility_id = dataToEncrypt.facility_id

  const { plaintextDek: generalDek, encryptedDek: encryptedDekGeneral } =
    await generateDataKey(KEK_GENERAL_PATH)
  const { plaintextDek: contactDek, encryptedDek: encryptedDekContact } =
    await generateDataKey(KEK_CONTACT_PATH)
  const { plaintextDek: clinicalDek, encryptedDek: encryptedDekClinical } =
    await generateDataKey(KEK_CLINICAL_PATH)
  const { plaintextDek: financialDek, encryptedDek: encryptedDekFinancial } =
    await generateDataKey(KEK_FINANCIAL_PATH)

  encryptedData.encrypted_dek_general = encryptedDekGeneral.toString('base64')
  encryptedData.encrypted_dek_contact = encryptedDekContact.toString('base64')
  encryptedData.encrypted_dek_clinical = encryptedDekClinical.toString('base64')
  encryptedData.encrypted_dek_financial =
    encryptedDekFinancial.toString('base64')

  // Encrypt all fields
  if (dataToEncrypt.resident_name) {
    encryptedData.encrypted_resident_name = encryptData(
      dataToEncrypt.resident_name,
      generalDek,
    )
  }
  if (dataToEncrypt.room_no) {
    encryptedData.encrypted_room_no = encryptData(
      dataToEncrypt.room_no,
      generalDek,
    )
  }
  if (dataToEncrypt.gender) {
    encryptedData.encrypted_gender = encryptData(
      dataToEncrypt.gender,
      generalDek,
    )
  }
  if (dataToEncrypt.avatar_url) {
    encryptedData.encrypted_avatar_url = encryptData(
      dataToEncrypt.avatar_url,
      generalDek,
    )
  }
  if (dataToEncrypt.resident_email) {
    encryptedData.encrypted_resident_email = encryptData(
      dataToEncrypt.resident_email,
      contactDek,
    )
  }
  if (dataToEncrypt.cell_phone) {
    encryptedData.encrypted_cell_phone = encryptData(
      dataToEncrypt.cell_phone,
      contactDek,
    )
  }
  if (dataToEncrypt.work_phone) {
    encryptedData.encrypted_work_phone = encryptData(
      dataToEncrypt.work_phone,
      contactDek,
    )
  }
  if (dataToEncrypt.home_phone) {
    encryptedData.encrypted_home_phone = encryptData(
      dataToEncrypt.home_phone,
      contactDek,
    )
  }
  if (dataToEncrypt.dob) {
    encryptedData.encrypted_dob = encryptData(dataToEncrypt.dob, contactDek)
  }
  if (dataToEncrypt.pcp) {
    encryptedData.encrypted_pcp = encryptData(dataToEncrypt.pcp, clinicalDek)
  }

  return EncryptedResidentSchema.parse(encryptedData)
}

export async function decryptResidentData(
  data: EncryptedResident,
  roles: string[],
): Promise<Resident> {
  const decryptedData: Partial<Resident> = {}
  decryptedData.facility_id = data.facility_id

  let generalDek: Buffer | string | Uint8Array | undefined
  let contactDek: Buffer | string | Uint8Array | undefined
  let clinicalDek: Buffer | string | Uint8Array | undefined

  const userRoles = roles.map((role) => role.toUpperCase())

  if (
    userRoles.includes('ADMIN') ||
    userRoles.includes('CLINICIAN') ||
    userRoles.includes('CAREGIVER') ||
    userRoles.includes('VIEWER')
  ) {
    if (data.encrypted_dek_general) {
      try {
        generalDek = await decryptDataKey(
          Buffer.from(data.encrypted_dek_general, 'base64'),
          KEK_GENERAL_PATH,
        )
      } catch (e) {
        console.error('Failed to decrypt general DEK:', e)
      }
    }
  }

  if (
    userRoles.includes('ADMIN') ||
    userRoles.includes('CLINICIAN') ||
    userRoles.includes('CAREGIVER')
  ) {
    if (data.encrypted_dek_contact) {
      try {
        contactDek = await decryptDataKey(
          Buffer.from(data.encrypted_dek_contact, 'base64'),
          KEK_CONTACT_PATH,
        )
      } catch (e) {
        console.error('Failed to decrypt contact DEK:', e)
      }
    }
  }

  if (userRoles.includes('ADMIN') || userRoles.includes('CLINICIAN')) {
    if (data.encrypted_dek_clinical) {
      try {
        clinicalDek = await decryptDataKey(
          Buffer.from(data.encrypted_dek_clinical, 'base64'),
          KEK_CLINICAL_PATH,
        )
      } catch (e) {
        console.error('Failed to decrypt clinical DEK:', e)
      }
    }
  }

  if (generalDek) {
    if (data.encrypted_resident_name)
      decryptedData.resident_name = decryptData(
        data.encrypted_resident_name,
        generalDek,
      )
    if (data.encrypted_gender)
      decryptedData.gender = decryptData(data.encrypted_gender, generalDek)
    if (data.encrypted_avatar_url)
      decryptedData.avatar_url = decryptData(
        data.encrypted_avatar_url,
        generalDek,
      )
    if (data.encrypted_room_no)
      decryptedData.room_no = decryptData(data.encrypted_room_no, generalDek)
  }

  if (contactDek) {
    if (data.encrypted_resident_email)
      decryptedData.resident_email = decryptData(
        data.encrypted_resident_email,
        contactDek,
      )
    if (data.encrypted_cell_phone)
      decryptedData.cell_phone = decryptData(
        data.encrypted_cell_phone,
        contactDek,
      )
    if (data.encrypted_work_phone)
      decryptedData.work_phone = decryptData(
        data.encrypted_work_phone,
        contactDek,
      )
    if (data.encrypted_home_phone)
      decryptedData.home_phone = decryptData(
        data.encrypted_home_phone,
        contactDek,
      )
    if (data.encrypted_dob)
      decryptedData.dob = decryptData(data.encrypted_dob, contactDek)
  }

  if (clinicalDek) {
    if (data.encrypted_pcp)
      decryptedData.pcp = decryptData(data.encrypted_pcp, clinicalDek)
  }

  return ResidentSchema.parse(decryptedData)
}

export const getResidentConverter = async (): Promise<
  FirestoreDataConverter<EncryptedResident, Resident>
> => ({
  toFirestore(resident: unknown): Resident {
    return ResidentSchema.parse(resident)
  },

  fromFirestore(
    snapshot: QueryDocumentSnapshot<DocumentData>,
  ): EncryptedResident {
    const data = snapshot.data()
    return EncryptedResidentSchema.parse(data)
  },
})

export const getFacilityConverter = async function () {
  return facilityConverter
}
// --- Subcollection Converters ---

// Generic encryption function for subcollection items
async function encryptSubcollectionItem<
  T extends { id?: string; [field: string]: any },
>(item: T, kekPath: string): Promise<any> {
  const { plaintextDek, encryptedDek } = await generateDataKey(kekPath)
  const encryptedData: any = { encrypted_dek: encryptedDek.toString('base64') }

  for (const key in item) {
    if (key !== 'id') {
      // Don't encrypt the ID
      encryptedData[`encrypted_${key}`] = encryptData(
        String((item as any)[key]),
        plaintextDek,
      )
    }
  }
  return encryptedData
}

// Generic decryption function for subcollection items
export async function decryptSubcollectionItem<T>(
  data: any,
  kekPath: string,
): Promise<T> {
  const dek = await decryptDataKey(
    Buffer.from(data.encrypted_dek, 'base64'),
    kekPath,
  )
  const decryptedData: any = { id: data.id }

  for (const key in data) {
    if (key.startsWith('encrypted_') && key !== 'encrypted_dek') {
      const newKey = key.replace('encrypted_', '')
      decryptedData[newKey] = decryptData(data[key], dek)
    }
  }
  return decryptedData as T
}

// Prescription Converter
export const getPrescriptionConverter = async (): Promise<
  FirestoreDataConverter<Prescription>
> => ({
  async toFirestore(prescription: Prescription): Promise<DocumentData> {
    return encryptSubcollectionItem(prescription, KEK_CLINICAL_PATH)
  },
  fromFirestore(snapshot: QueryDocumentSnapshot<DocumentData>): Prescription {
    return EncryptedPrescriptionSchema.parse(snapshot.data()) as any // Cast needed as it's encrypted
  },
})

// Financial Transaction Converter
export const getFinancialTransactionConverter = async (): Promise<
  FirestoreDataConverter<FinancialTransaction>
> => ({
  async toFirestore(transaction: FinancialTransaction): Promise<DocumentData> {
    return encryptSubcollectionItem(transaction, KEK_FINANCIAL_PATH)
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot<DocumentData>,
  ): FinancialTransaction {
    return EncryptedFinancialTransactionSchema.parse(snapshot.data()) as any
  },
})

// EmarRecord (Prescription Administration) Converter
export const getEmarRecordConverter = async (): Promise<
  FirestoreDataConverter<any, DocumentData>
> => ({
  async toFirestore(adminRecord: any): Promise<DocumentData> {
    return encryptSubcollectionItem(adminRecord, KEK_CLINICAL_PATH)
  },
  fromFirestore(snapshot: QueryDocumentSnapshot<DocumentData>): any {
    return EncryptedEmarRecordSchema.parse(snapshot.data())
  },
})
