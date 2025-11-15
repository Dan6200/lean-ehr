import {
  FirestoreEvent,
  Change,
  QueryDocumentSnapshot,
} from 'firebase-functions/v2/firestore'
import bigqueryClient from '../lib/bigquery'
import { decryptData } from '../lib/encryption'

const DATASET_ID = 'firestore_export'

export async function streamToBigQuery(
  collectionName: string,
  event: FirestoreEvent<Change<QueryDocumentSnapshot> | undefined>,
) {
  const documentId = event.params[Object.keys(event.params)[0]]
  const tableId = `${collectionName}_raw`

  if (!event.data) {
    console.log(
      `No data for event on document ${documentId} in ${collectionName}.`,
    )
    return null
  }

  const { after } = event.data

  if (!after.exists) {
    console.log(
      `Document ${documentId} in ${collectionName} was deleted. No action taken for now.`,
    )
    return null
  }

  const encryptedData = after.data()
  if (!encryptedData) {
    console.log(
      `No data found for document ${documentId} in ${collectionName}.`,
    )
    return null
  }

  try {
    const decryptedData = await decryptData(encryptedData)

    const row = {
      document_id: documentId,
      ...decryptedData,
    }

    await bigqueryClient.dataset(DATASET_ID).table(tableId).insert([row])
    console.log(
      `Successfully decrypted and streamed document ${documentId} from ${collectionName} to BigQuery.`,
    )
  } catch (error) {
    console.error(
      `Failed to decrypt and stream document ${documentId} from ${collectionName} to BigQuery:`,
      error,
    )
  }
  return null
}
