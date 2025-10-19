'use server'
import { collection, doc, writeBatch } from 'firebase/firestore'

export async function updateMedicalRecords(
  records: MedicalRecord[],
  residentId: string,
  deletedRecordIds: string[] = [],
): Promise<{ success: boolean; message: string }> {
  const { currentUser } = await getAuthenticatedAppForUser()
  if (!currentUser) {
    throw new Error('Not authenticated')
  }

  try {
    const batch = writeBatch(db)
    const recordsRef = collection(
      db,
      'residents',
      residentId,
      'medical_records',
    )

    records.forEach((record) => {
      const { id, ...recordData } = record
      const docRef = id ? doc(recordsRef, id) : doc(recordsRef)
      batch.set(docRef, recordData, { merge: true })
    })

    deletedRecordIds.forEach((id) => {
      const docRef = doc(recordsRef, id)
      batch.delete(docRef)
    })

    await batch.commit()

    return { success: true, message: 'Medical records updated successfully.' }
  } catch (error) {
    console.error('Error updating medical records: ', error)
    return { success: false, message: 'Failed to update medical records.' }
  }
}
