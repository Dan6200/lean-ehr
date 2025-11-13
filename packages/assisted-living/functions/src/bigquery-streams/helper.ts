import * as functions from 'firebase-functions'
import bigqueryClient from '../../../lib/bigquery'

const DATASET_ID = 'firestore_export'

export async function streamToBigQuery(
  collectionName: string,
  change: functions.Change<functions.firestore.DocumentSnapshot>,
  context: functions.EventContext,
) {
  const documentId = context.params[Object.keys(context.params)[0]]
  const tableId = `${collectionName}_raw`

  if (!change.after.exists) {
    console.log(
      `Document ${documentId} in ${collectionName} was deleted. No action taken for now.`,
    )
    return null
  }

  const data = change.after.data()
  if (!data) {
    console.log(
      `No data found for document ${documentId} in ${collectionName}.`,
    )
    return null
  }

  const rows = [
    {
      document_id: documentId,
      data: JSON.stringify(data),
      timestamp: context.timestamp,
    },
  ]

  try {
    await bigqueryClient.dataset(DATASET_ID).table(tableId).insert(rows)
    console.log(
      `Successfully streamed document ${documentId} from ${collectionName} to BigQuery.`,
    )
  } catch (error) {
    console.error(
      `Failed to stream document ${documentId} from ${collectionName} to BigQuery:`,
      error,
    )
  }
  return null
}
