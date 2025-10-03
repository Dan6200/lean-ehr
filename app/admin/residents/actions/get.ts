'use server'
import { collectionWrapper } from '@/firebase/firestore'
import {
  Resident,
  Facility,
  ResidentSchema,
  FacilitySchema,
  ResidentDataSchema,
  facilityConverter,
  createResidentConverter,
} from '@/types'
import { notFound } from 'next/navigation'
import { z } from 'zod'
import { getEncryptionKey } from '../../actions/get-encryption-key'
import { verifySessionCookie } from '@/firebase/auth/server/definitions'

export async function getResidentData(
  documentId: string,
): Promise<z.infer<typeof ResidentDataSchema>> {
  try {
    const idToken = await verifySessionCookie()
    if (!idToken) throw new Error('Failed to verify session token')
    const { key: encryptionKey } = await getEncryptionKey()
    if (!encryptionKey) throw new Error('failed to retrieve encryption key')
    const residentsColRef = collectionWrapper('residents').withConverter(
      createResidentConverter(encryptionKey),
    )
    const residentsSnap = await residentsColRef.doc(documentId).get()
    if (!residentsSnap.exists) throw notFound()
    const resident = residentsSnap.data()
    let validatedResident: Resident
    try {
      validatedResident = ResidentSchema.parse(resident)
    } catch (error: any) {
      throw new Error(
        'Object is not of type Resident  -- Tag:16: ' + error.message,
      )
    }
    const facilitySnap = await collectionWrapper('facilites')
      .withConverter(facilityConverter)
      .where('facility_id', '==', validatedResident.facility_id)
      .limit(1)
      .get()

    const { address } = facilitySnap.docs[0].data()

    return { ...validatedResident, document_id: residentsSnap.id, address }
  } catch (error) {
    throw new Error('Failed to fetch resident.\n\t\t' + error)
  }
}

export async function getResidents() {
  try {
    const residentsCollection = collectionWrapper('residents')
    const residentsSnap = await residentsCollection.get()
    return residentsSnap.docs.map((doc) => {
      const resident = doc.data()
      let validatedResident: Resident
      try {
        validatedResident = ResidentSchema.parse(resident)
      } catch (error: any) {
        throw new Error(
          'Object is not of type Resident  -- Tag:20: ' + error.message,
        )
      }
      return validatedResident
    })
  } catch (error) {
    throw new Error('Failed to fetch All Residents Data.\n\t\t' + error)
  }
}

export async function getAllFacilities() {
  try {
    const facilitiesCollection = collectionWrapper(
      'providers/GYRHOME/facilities',
    )
    const facilitiesSnap = await facilitiesCollection.get()
    if (!facilitiesSnap.size) throw notFound()
    return facilitiesSnap.docs.map((doc) => {
      const facility = { document_id: doc.id, ...doc.data() }
      let validatedFacility: Facility
      try {
        validatedFacility = FacilitySchema.parse(facility)
      } catch (error: any) {
        throw new Error(
          'Object is not of type Facility  -- Tag:19: ' + error.message,
        )
      }
      return validatedFacility
    })
  } catch (error) {
    throw new Error('Failed to fetch All Facilities.\n\t\t' + error)
  }
}

export async function getAllResidentsData() {
  try {
    const idToken = await verifySessionCookie()
    if (!idToken) throw new Error('Failed to verify session token')
    const { key: encryptionKey } = await getEncryptionKey()
    if (!encryptionKey) throw new Error('failed to retrieve encryption key')
    // Fetch and join address data...
    const facilitiesCollection = collectionWrapper(
      'providers/GYRHOME/facilites',
    ).withConverter(facilityConverter)
    const facilitiesData = await facilitiesCollection.get()
    const residentsCollection = collectionWrapper(
      `providers/GYRHOME/residents`,
    ).withConverter(createResidentConverter(encryptionKey))
    const resQ = residentsCollection
    const residentsData = await resQ.get()
    const facility_lookup: { [id: string]: string } =
      facilitiesData.docs.reduce(
        (lookup: { [id: string]: any }, facility) => ({
          ...lookup,
          [facility.id]: facility.data().address,
        }),
        {},
      )
    return residentsData.docs.reduce((residents: any, resident) => {
      const address = facility_lookup[resident.data().facility_id]
      const { facility_id, ...newRes } = resident.data()
      return [
        ...(residents ?? []),
        { ...newRes, document_id: resident.id, address },
      ]
    }, [])
  } catch (error) {
    throw new Error('Failed to fetch All Residents Data:\n\t\t' + error)
  }
}
