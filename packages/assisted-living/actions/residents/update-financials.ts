import { collection, doc, writeBatch } from 'firebase/firestore'

export async function updateFinancials(
  financials: FinancialTransaction[],
  residentId: string,
  deletedFinancialIds: string[] = [],
): Promise<{ success: boolean; message: string }> {
  const { currentUser } = await getAuthenticatedAppForUser()
  if (!currentUser) {
    throw new Error('Not authenticated')
  }

  try {
    const batch = writeBatch(db)
    const financialsRef = collection(db, 'residents', residentId, 'financials')

    financials.forEach((item) => {
      const { id, ...itemData } = item
      const docRef = id ? doc(financialsRef, id) : doc(financialsRef)
      batch.set(docRef, itemData, { merge: true })
    })

    deletedFinancialIds.forEach((id) => {
      const docRef = doc(financialsRef, id)
      batch.delete(docRef)
    })

    await batch.commit()

    return { success: true, message: 'Financials updated successfully.' }
  } catch (error) {
    console.error('Error updating financials: ', error)
    return { success: false, message: 'Failed to update financials.' }
  }
}
