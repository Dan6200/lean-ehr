# BigQuery Data Loading

This document outlines the steps to load external datasets like LOINC into BigQuery for use in the application.

---

## 1. Loading the LOINC Dataset

Since Google Cloud does not maintain a public LOINC dataset, we must host our own. The following steps describe how to load the official LOINC data from their CSV distribution into a private BigQuery table.

### Prerequisites

1.  **Download LOINC:** Download the "LOINC Table File (CSV)" zip file from the official [LOINC website](https://loinc.org/downloads/loinc-table-file-csv/).
2.  **Google Cloud Storage Bucket:** You must have a GCS bucket available to stage the CSV file for loading.

### Steps

1.  **Unzip and Prepare the CSV:**
    - Unzip the downloaded file.
    - You will find several CSV files. The most important one is `Loinc.csv`. For our purposes, we only need a few columns from this file.

2.  **Upload CSV to Google Cloud Storage (GCS):**
    - Upload the `Loinc.csv` file to your GCS bucket. You can do this via the Cloud Console UI or using the `gcloud` CLI:

    ```bash
    # Replace [BUCKET_NAME] with your GCS bucket name
    gcloud storage cp Loinc.csv gs://[BUCKET_NAME]/loinc/Loinc.csv
    ```

3.  **Create a BigQuery Dataset:**
    - Create a new dataset in BigQuery to hold your LOINC table.

    ```bash
    # Replace [PROJECT_ID] and [DATASET_NAME] (e.g., 'loinc')
    bq --location=US mk -d --project_id=[PROJECT_ID] [DATASET_NAME]
    ```

4.  **Load the Data into BigQuery:**
    - Use the `bq load` command to load the data from GCS. This command specifies the schema for the most relevant columns.
    - The `--autodetect` flag can also be used, but explicitly defining the schema is more robust.

    ```bash
    # Replace [PROJECT_ID], [DATASET_NAME], and [BUCKET_NAME]
    bq load --source_format=CSV --skip_leading_rows=1 \
    --project_id=[PROJECT_ID] \
    [DATASET_NAME].loinc_core \
    gs://[BUCKET_NAME]/loinc/Loinc.csv \
    LOINC_NUM:STRING,COMPONENT:STRING,SYSTEM:STRING,LONG_COMMON_NAME:STRING,SHORTNAME:STRING
    ```

### 5. Create the Server Action (`search-loinc.ts`)

Once the table is loaded, you can create the server action to query it. The query would look something like this:

```typescript
// actions/lookups/search-loinc.ts

const query = `
  SELECT
    LOINC_NUM as code,
    LONG_COMMON_NAME as name
  FROM
    `[PROJECT_ID].[DATASET_NAME].loinc_core`
  WHERE
    LONG_COMMON_NAME LIKE @searchTerm
  LIMIT 10;
`

// ... rest of the server action logic
```
