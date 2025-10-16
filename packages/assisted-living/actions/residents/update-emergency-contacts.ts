'use server'
import {
  collectionWrapper,
  docWrapper,
  updateDocWrapper,
} from '@/firebase/firestore-server'
import { EncryptedResident, EmergencyContact } from '@/types'
import { getAuthenticatedAppAndClaims } from '@/auth/server/definitions'
import { getResidentConverter, encryptResident } from '@/types/converters'

export async function updateEmergencyContacts(
  contacts: EmergencyContact[],
  documentId: string,
) {
  try {
    const authenticatedApp = await getAuthenticatedAppAndClaims()
    if (!authenticatedApp) throw new Error('Failed to authenticate session')
    const { app } = authenticatedApp

    // We need to re-encrypt the contacts part of the resident data
    // For this, we can create a partial resident object and encrypt it.
    // NOTE: This is a simplified approach. A more robust solution might involve
    // a dedicated encryption function for just the contacts array.
    const partialResident = { emergency_contacts: contacts } as any
    const encryptedPartial = await encryptResident(partialResident)

    await updateDocWrapper(
      await docWrapper(
        (
          await collectionWrapper<EncryptedResident>(app, 'residents')
        ).withConverter(await getResidentConverter()),
        documentId,
      ),
      { emergency_contacts: encryptedPartial.emergency_contacts },
    )

    return {
      success: true,
      message: 'Successfully Updated Emergency Contacts',
    }
  } catch (error: any) {
    console.error('Failed to Update Emergency Contacts:', error)
    return {
      success: false,
      message: error.message || 'Failed to Update Emergency Contacts',
    }
  }
}
