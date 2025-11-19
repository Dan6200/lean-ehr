'use server'
import {
  collectionWrapper,
  deleteDocWrapper,
  docWrapper,
} from '#root/firebase/admin'
import { verifySession } from '#root/auth/server/definitions'
import { EncryptedResident } from '#root/types'
import { getResidentConverter } from '#root/types/converters'

export async function deleteResidentData(documentId: string) {
  try {
    await verifySession() // Authenticate the request first

    const residentsCollection = (
      await collectionWrapper<EncryptedResident>('providers/GYRHOME/residents')
    ).withConverter(await getResidentConverter())

    const residentDocRef = await docWrapper(residentsCollection, documentId)

    await deleteDocWrapper(residentDocRef)

    return { success: true, message: 'Successfully Deleted Resident' }
  } catch (error: any) {
    console.error('Failed to Delete the Resident:', error)
    return {
      success: false,
      message: error.message || 'Failed to Delete the Resident.',
    }
  }
}
