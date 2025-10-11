'use server'
import { collectionWrapper } from '@/firebase/firestore-server'
import { Resident, EncryptedResident } from '@/types'
import { getAuthenticatedAppAndClaims } from '@/firebase/auth/server/definitions'
import { encryptResident, getResidentConverter } from '@/types/converters'

export async function addNewResident(
  residentData: Omit<Resident, 'resident_id'>,
) {
  try {
    const authenticatedApp = await getAuthenticatedAppAndClaims()
    if (!authenticatedApp) throw new Error('Failed to authenticate session')
    const { app } = authenticatedApp

    const metadataRef = collectionWrapper(app, 'metadata').doc('lastResidentID')
    const metadataSnap = await metadataRef.get()
    if (!metadataSnap.exists())
      throw new Error('lastResidentID metadata not found')
    const { resident_id: oldResidentId } = metadataSnap.data() as {
      resident_id: string
    }
    const resident_id = (parseInt(oldResidentId) + 1).toString()
    const resident: Resident = {
      ...residentData,
      resident_id,
    }

    const encryptedResident = await encryptResident(resident)

    const residentRef = collectionWrapper<EncryptedResident>(app, 'residents')
      .withConverter(await getResidentConverter())
      .doc()

    await residentRef.set(encryptedResident)
    await metadataRef.update({ resident_id })

    return {
      message: 'Successfully Added a New Resident',
      success: true,
    }
  } catch (error: any) {
    console.error('Failed to Add a New Resident.', error)
    return {
      success: false,
      message: error.message || 'Failed to Add a New Resident',
    }
  }
}
