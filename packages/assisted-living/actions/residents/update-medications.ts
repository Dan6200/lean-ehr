'use server'
import { collection, doc, writeBatch } from 'firebase/firestore'

export async function updateMedications(
  medications: Medication[],
  residentId: string,
  deletedMedicationIds: string[] = [],
): Promise<{ success: boolean; message: string }> {
  const { currentUser } = await getAuthenticatedAppForUser()
  if (!currentUser) {
    throw new Error('Not authenticated')
  }

  try {
    const batch = writeBatch(db)
    const medicationsRef = collection(
      db,
      'residents',
      residentId,
      'medications',
    )

    medications.forEach((med) => {
      const { id, ...medData } = med
      const docRef = id ? doc(medicationsRef, id) : doc(medicationsRef)
      batch.set(docRef, medData, { merge: true })
    })

    deletedMedicationIds.forEach((id) => {
      const docRef = doc(medicationsRef, id)
      batch.delete(docRef)
    })

    await batch.commit()

    return { success: true, message: 'Medications updated successfully.' }
  } catch (error) {
    console.error('Error updating medications: ', error)
    return { success: false, message: 'Failed to update medications.' }
  }
}
