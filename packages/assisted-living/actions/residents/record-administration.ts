'use server'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/firestore-server'
import {
  Administration,
  EncryptedResident,
  Resident,
  Medication,
} from '@/types'
import { getAuthenticatedAppForUser } from '@/auth/server/auth'
import { decryptResidentData, encryptResident } from '@/types/converters'

export async function recordAdministration(
  residentId: string,
  medicationName: string,
  administration: Administration,
): Promise<{ success: boolean; message: string }> {
  const { currentUser } = await getAuthenticatedAppForUser()
  if (!currentUser) {
    throw new Error('Not authenticated')
  }

  try {
    const residentRef = doc(db, 'residents', residentId)
    const residentSnap = await getDoc(residentRef)

    if (!residentSnap.exists()) {
      throw new Error('Resident not found')
    }

    const encryptedData = residentSnap.data() as EncryptedResident
    const residentData = await decryptResidentData(encryptedData, ['ADMIN']) // Assuming admin for now

    const medicationIndex = residentData.medications?.findIndex(
      (med) => med.name === medicationName,
    )

    if (medicationIndex === undefined || medicationIndex === -1) {
      throw new Error('Medication not found')
    }

    if (!residentData.medications![medicationIndex].administrations) {
      residentData.medications![medicationIndex].administrations = []
    }

    residentData.medications![medicationIndex].administrations!.push(
      administration,
    )

    const newEncryptedData = await encryptResident(residentData)

    await updateDoc(residentRef, newEncryptedData)

    return { success: true, message: 'Administration recorded successfully.' }
  } catch (error) {
    console.error('Error recording administration: ', error)
    return { success: false, message: 'Failed to record administration.' }
  }
}
