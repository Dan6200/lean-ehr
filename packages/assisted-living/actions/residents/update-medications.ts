'use server'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase/firestore-server'
import { Medication, EncryptedMedicationSchema } from '@/types'
import { getAuthenticatedAppForUser } from '@/auth/server/auth'
import {
  encryptData,
  generateDataKey,
  KEK_CLINICAL_PATH,
} from '@/lib/encryption'

export async function updateMedications(
  medications: Medication[],
  residentId: string,
): Promise<{ success: boolean; message: string }> {
  const { currentUser } = await getAuthenticatedAppForUser()
  if (!currentUser) {
    throw new Error('Not authenticated')
  }

  try {
    const { plaintextDek: clinicalDek } =
      await generateDataKey(KEK_CLINICAL_PATH)

    const encryptedMedications = medications.map((med) => {
      const enc: any = {}
      if (med.name) enc.encrypted_name = encryptData(med.name, clinicalDek)
      if (med.rxnorm_code)
        enc.encrypted_rxnorm_code = encryptData(med.rxnorm_code, clinicalDek)
      if (med.dosage)
        enc.encrypted_dosage = encryptData(med.dosage, clinicalDek)
      if (med.frequency)
        enc.encrypted_frequency = encryptData(med.frequency, clinicalDek)
      return EncryptedMedicationSchema.parse(enc)
    })

    const residentRef = doc(db, 'residents', residentId)
    await updateDoc(residentRef, {
      encrypted_medications: encryptedMedications,
    })

    return { success: true, message: 'Medications updated successfully.' }
  } catch (error) {
    console.error('Error updating medications: ', error)
    return { success: false, message: 'Failed to update medications.' }
  }
}
