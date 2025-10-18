'use server'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase/firestore-server'
import { MedicalRecord, EncryptedMedicalRecordSchema } from '@/types'
import { getAuthenticatedAppForUser } from '@/auth/server/auth'
import {
  encryptData,
  generateDataKey,
  KEK_CLINICAL_PATH,
} from '@/lib/encryption'

export async function updateMedicalRecords(
  records: MedicalRecord[],
  residentId: string,
): Promise<{ success: boolean; message: string }> {
  const { currentUser } = await getAuthenticatedAppForUser()
  if (!currentUser) {
    throw new Error('Not authenticated')
  }

  try {
    const { plaintextDek: clinicalDek } =
      await generateDataKey(KEK_CLINICAL_PATH)

    const encryptedRecords = records.map((record) => {
      const enc: any = {}
      if (record.date)
        enc.encrypted_date = encryptData(record.date, clinicalDek)
      if (record.title)
        enc.encrypted_title = encryptData(record.title, clinicalDek)
      if (record.notes)
        enc.encrypted_notes = encryptData(record.notes, clinicalDek)
      if (record.snomed_code)
        enc.encrypted_snomed_code = encryptData(record.snomed_code, clinicalDek)
      return EncryptedMedicalRecordSchema.parse(enc)
    })

    const residentRef = doc(db, 'residents', residentId)
    await updateDoc(residentRef, {
      encrypted_medical_records: encryptedRecords,
    })

    return { success: true, message: 'Medical records updated successfully.' }
  } catch (error) {
    console.error('Error updating medical records: ', error)
    return { success: false, message: 'Failed to update medical records.' }
  }
}
