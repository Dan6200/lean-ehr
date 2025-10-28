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
import { EncryptedAllergySchema, Allergy, AllergySchema } from '@/types'
import z from 'zod'

export async function decryptAllergy(
  data: z.infer<typeof EncryptedAllergySchema>,
): Promise<Allergy> {
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

  if (decryptedData.substance) {
    decryptedData.substance = JSON.parse(decryptedData.substance)
  }
  if (decryptedData.reaction) {
    decryptedData.reaction = JSON.parse(decryptedData.reaction)
  }

  return AllergySchema.parse(decryptedData)
}

export const getAllergiesConverter = (): FirestoreDataConverter<
  z.infer<typeof EncryptedAllergySchema>
> => ({
  toFirestore(allergy: z.infer<typeof EncryptedAllergySchema>): DocumentData {
    return EncryptedAllergySchema.parse(allergy)
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
  ): z.infer<typeof EncryptedAllergySchema> {
    return EncryptedAllergySchema.parse(snapshot.data())
  },
})
