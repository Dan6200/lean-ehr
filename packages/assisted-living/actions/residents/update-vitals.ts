'use server'
import { collection, doc, writeBatch } from 'firebase/firestore'

export async function updateVitals(
  vitals: Vital[],
  residentId: string,
  deletedVitalIds: string[] = [],
): Promise<{ success: boolean; message: string }> {
  const { currentUser } = await getAuthenticatedAppForUser()
  if (!currentUser) {
    throw new Error('Not authenticated')
  }

  try {
    const batch = writeBatch(db)
    const vitalsRef = collection(db, 'residents', residentId, 'vitals')

    vitals.forEach((vital) => {
      const { id, ...vitalData } = vital
      const docRef = id ? doc(vitalsRef, id) : doc(vitalsRef)
      batch.set(docRef, vitalData, { merge: true })
    })

    deletedVitalIds.forEach((id) => {
      const docRef = doc(vitalsRef, id)
      batch.delete(docRef)
    })

    await batch.commit()

    return { success: true, message: 'Vitals updated successfully.' }
  } catch (error) {
    console.error('Error updating vitals: ', error)
    return { success: false, message: 'Failed to update vitals.' }
  }
}
