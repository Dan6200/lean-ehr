'use server'
import { collectionWrapper } from '@/firebase/firestore-server'
import { notFound } from 'next/navigation'
import { getAuthenticatedAppAndClaims } from '@/firebase/auth/server/definitions'

export async function deleteResidentData(documentId: string) {
  try {
    const authenticatedApp = await getAuthenticatedAppAndClaims()
    if (!authenticatedApp) throw new Error('Failed to authenticate session')
    const { app } = authenticatedApp

    const residentDocRef = collectionWrapper(app, 'residents').doc(documentId)

    await residentDocRef.delete()

    return { success: true, message: 'Successfully Deleted Resident' }
  } catch (error: any) {
    console.error('Failed to Delete the Resident:', error)
    return {
      success: false,
      message: error.message || 'Failed to Delete the Resident.',
    }
  }
}
