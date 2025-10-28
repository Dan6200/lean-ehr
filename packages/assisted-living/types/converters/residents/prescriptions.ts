'use server'
import {
  KEK_CLINICAL_PATH,
  decryptDataKey,
  decryptData,
} from '@/lib/encryption'
import {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
} from 'firebase-admin/firestore'
import {
  EncryptedPrescriptionSchema,
  Prescription,
  PrescriptionSchema,
} from '@/types'
import z from 'zod'

export async function decryptPrescription(
  data: z.infer<typeof EncryptedPrescriptionSchema>,
): Promise<Prescription> {
  const dek = await decryptDataKey(
    Buffer.from(data.encrypted_dek, 'base64'),
    KEK_CLINICAL_PATH,
  )
  const decryptedData: any = {}

  for (const key in data) {
    if (key.startsWith('encrypted_') && key !== 'encrypted_dek') {
      const newKey = key.replace('encrypted_', '')
      decryptedData[newKey] = decryptData((data as any)[key], dek)
    }
  }

  if (decryptedData.medication) {
    decryptedData.medication = JSON.parse(decryptedData.medication)
  }
  if (decryptedData.dosageInstruction) {
    decryptedData.dosageInstruction = JSON.parse(
      decryptedData.dosageInstruction,
    )
  }

  return PrescriptionSchema.parse(decryptedData)
}

export const getPrescriptionsConverter = async (): Promise<
  FirestoreDataConverter<z.infer<typeof EncryptedPrescriptionSchema>>
> => ({
  toFirestore(
    prescription: z.infer<typeof EncryptedPrescriptionSchema>,
  ): DocumentData {
    return EncryptedPrescriptionSchema.parse(prescription)
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
  ): z.infer<typeof EncryptedPrescriptionSchema> {
    return EncryptedPrescriptionSchema.parse(snapshot.data())
  },
})
