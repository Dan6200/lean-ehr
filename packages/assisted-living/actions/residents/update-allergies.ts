import { collection, doc, writeBatch } from 'firebase/firestore'

export async function updateAllergies(
  allergies: Allergy[],
  residentId: string,
  deletedAllergyIds: string[] = [],
): Promise<{ success: boolean; message: string }> {
  const { currentUser } = await getAuthenticatedAppForUser()
  if (!currentUser) {
    throw new Error('Not authenticated')
  }

  try {
    const batch = writeBatch(db)
    const allergiesRef = collection(db, 'residents', residentId, 'allergies')

    // Handle creations and updates
    allergies.forEach((allergy) => {
      const { id, ...allergyData } = allergy
      const docRef = id ? doc(allergiesRef, id) : doc(allergiesRef) // Create new doc if no ID
      batch.set(docRef, allergyData, { merge: true })
    })

    // Handle deletions
    deletedAllergyIds.forEach((id) => {
      const docRef = doc(allergiesRef, id)
      batch.delete(docRef)
    })

    await batch.commit()

    return { success: true, message: 'Allergies updated successfully.' }
  } catch (error) {
    console.error('Error updating allergies: ', error)
    return { success: false, message: 'Failed to update allergies.' }
  }
}
