import * as functions from 'firebase-functions'
import bigqueryClient from '../../lib/bigquery'

// Define the BigQuery dataset and table IDs
const DATASET_ID = 'firestore_export' // Or your desired dataset ID
const CHARGES_TABLE_ID = 'charges_raw' // Or your desired table ID

/**
 * A Firestore trigger that streams new or updated documents from the 'charges'
 * collection in the 'staging-beta' database to a BigQuery table.
 */
export const onChargeWritten = functions
  .runWith({
    // Ensure the function has the necessary permissions for BigQuery
    // You may need to grant the function's service account the "BigQuery Data Editor" role.
  })
  .firestore.database('staging-beta')
  .document('charges/{chargeId}')
  .onWrite(async (change, context) => {
    const { chargeId } = context.params

    // If the document is deleted, we might want to handle that in BigQuery as well
    // For now, we will focus on creates and updates.
    if (!change.after.exists) {
      console.log(`Charge ${chargeId} was deleted. No action taken.`)
      return null
    }

    const data = change.after.data()

    // The data from Firestore needs to be in a format that BigQuery can accept.
    // For simplicity, we'll insert the whole document as a JSON string.
    const rows = [
      {
        document_id: chargeId,
        data: JSON.stringify(data),
        timestamp: context.timestamp,
      },
    ]

    try {
      await bigqueryClient
        .dataset(DATASET_ID)
        .table(CHARGES_TABLE_ID)
        .insert(rows)
      console.log(`Successfully inserted charge ${chargeId} into BigQuery.`)
    } catch (error) {
      console.error(`Failed to insert charge ${chargeId} into BigQuery:`, error)
      // You might want to add more robust error handling or a retry mechanism here
    }

    return null
  })
