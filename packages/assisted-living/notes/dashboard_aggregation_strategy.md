# Dashboard Aggregation Strategy: From Firestore to BigQuery via Cloud Functions

This document outlines the plan to refactor the dashboard's data aggregation logic to resolve `RESOURCE_EXHAUSTED` errors and create a scalable, efficient architecture that supports our multi-database environment.

---

## 1. The Problem: Multiple Issues with an In-App Approach

The original "fetch-then-aggregate" pattern in the dashboard was not scalable. However, the initial proposed solution of using the official "Stream to BigQuery" Firebase Extension also presented critical blockers.

### Problem A: In-Memory Aggregation is Not Scalable

The `getChartData` function was fetching all documents from multiple collections for every resident, loading them into memory, and then aggregating. This leads to a "N+1" query explosion, causing `RESOURCE_EXHAUSTED` errors as data grows.

### Problem B: Official Extension Lacks Essential Features

The standard "Stream to BigQuery" Firebase Extension is insufficient for our needs for two key reasons:

1.  **No Support for Multiple Databases:** The extension cannot be configured to listen to a specific named database (e.g., `staging-beta`), making it unusable for our multi-environment setup.
2.  **No Decryption Step:** The extension streams raw, encrypted data to BigQuery. This would force us to perform complex and costly decryption within our BigQuery queries, which is inefficient and a poor security practice.

---

## 2. The Solution: Custom Cloud Functions as a Decryption & Streaming Pipeline

The correct solution is to build our own data pipeline using **Firebase Cloud Functions** with **Firestore Triggers**. This approach gives us full control over the data streaming process and solves all the identified problems.

We will create a set of Cloud Functions that trigger on any document write (`onDocumentWritten`) in our specified Firestore collections. Each function will then decrypt the data and stream the plaintext result into the appropriate BigQuery table.

### Benefits of this Approach:

- **Multi-Database Support:** Cloud Functions can be explicitly configured to trigger on a specific database ID (e.g., `staging-beta`).
- **Pre-Processing and Decryption:** We control the code, allowing us to decrypt the data on the fly before it ever reaches BigQuery. This means BigQuery tables will contain clean, plaintext data, making queries simpler and faster.
- **Eliminates Resource Exhaustion:** The application's dashboard will run a single query against BigQuery instead of hundreds of reads against Firestore.
- **Scalability:** Both Cloud Functions and BigQuery are highly scalable, ensuring the entire pipeline remains efficient as data volume grows.

---

## 3. Implementation Plan

### Phase 1: Infrastructure & Backend

1.  **Create Custom Cloud Functions:**
    - In the `functions/` directory, create a separate trigger function for each collection we need to stream (e.g., `charges`, `claims`, `residents`).
    - Each function will be configured with `{database: 'staging-beta', document: 'path/to/{docId}'}` to listen to the correct database and collection.
    - A helper function (`helper.ts`) will contain the core logic for receiving the event, decrypting the data using the appropriate KEK, and inserting the plaintext data into the corresponding BigQuery table.

2.  **Create a Backfill Script:**
    - A one-time script (`backfill-bigquery.ts`) is required to process all _existing_ documents in Firestore.
    - This script will iterate through the collections, decrypt each document, and bulk-insert them into the BigQuery tables.

3.  **Create the Aggregation SQL Query:**
    - A file at `lib/bigquery/queries.ts` will house the SQL query.
    - Because the data in BigQuery is now clean, the query will be simpler. It will `UNION ALL` the tables, `GROUP BY` date, and `SUM` the amounts.

### Phase 2: Application Layer Refactoring

1.  **Rewrite `getChartData`:**
    - The `getChartData` function in `app/admin/dashboard/page.tsx` will be rewritten to use the `bigqueryClient` and execute the new, simpler aggregation query.

### Phase 3: Frontend (No Changes Needed)

The frontend components (`DashboardClient`, `SectionCards`, `ChartAreaInteractive`) will require **no changes**, as they will receive the same data structure as before.
