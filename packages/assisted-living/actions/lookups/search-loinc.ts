'use server'

import { bigqueryClient } from '#root/lib/bigquery'
import { verifySession } from '#root/auth/server/definitions'

// This assumes your BigQuery LOINC table is in a dataset named 'loinc'
// and the table is named 'loinc_core'.
// The project ID is assumed to be available in an environment variable.
const BQ_PROJECT_ID = process.env.GCP_PROJECT_ID || 'lean-ehr'
const BQ_DATASET_ID = 'loinc'
const BQ_TABLE_ID = 'loinc_core'

/**
 * Searches a private LOINC table in BigQuery for matching codes.
 * @param searchTerm The term to search for in the LONG_COMMON_NAME field.
 * @returns A promise that resolves to an array of objects with code and name.
 */
export async function searchLoinc(
  searchTerm: string,
): Promise<{ code: string; name: string }[]> {
  await verifySession()

  if (!searchTerm) {
    return []
  }

  // Use '%' as a wildcard for a LIKE query
  const cleanedSearchTerm = searchTerm.trim().toLowerCase() + '%'

  const query = `
    SELECT
      LOINC_NUM AS code,
      LONG_COMMON_NAME AS name
    FROM
      \`${BQ_PROJECT_ID}.${BQ_DATASET_ID}.${BQ_TABLE_ID}\`
    WHERE
      LOWER(LONG_COMMON_NAME) LIKE @searchTerm
    LIMIT 25;
  `

  const options = {
    query: query,
    location: 'EU', // Ensure this matches your dataset's location
    params: { searchTerm: cleanedSearchTerm },
  }

  try {
    const [rows] = await bigqueryClient.query(options)
    return rows
  } catch (error) {
    console.error('Error searching LOINC in BigQuery:', error)
    // In a production app, you might want to handle this more gracefully
    return []
  }
}
