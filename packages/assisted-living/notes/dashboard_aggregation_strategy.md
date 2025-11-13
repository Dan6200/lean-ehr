# Dashboard Aggregation Strategy: From Firestore to BigQuery

This document outlines the plan to refactor the dashboard's data aggregation logic to resolve `RESOURCE_EXHAUSTED` errors and create a scalable, efficient architecture.

---

## 1. The Problem: In-Memory Aggregation is Not Scalable

The current implementation of the `getChartData` function in `app/admin/dashboard/page.tsx` follows a "fetch-then-aggregate" pattern:

1.  It fetches a list of all residents.
2.  For each resident, it fetches all documents from four separate subcollections (`charges`, `claims`, `payments`, `adjustments`).
3.  It loads all of this raw data into the memory of the serverless function.
4.  It then aggregates the data in JavaScript.

This approach leads to a "N+1" query explosion. For 100 residents, this results in over 400 individual database reads and pulls tens of thousands of documents into memory. This is the direct cause of the `RESOURCE_EXHAUSTED: Bandwidth exhausted or memory limit exceeded` error and is not a sustainable architecture.

---

## 2. The Solution: Offload Aggregation to BigQuery

The correct solution is to move the aggregation logic from the application layer to the database layer. While Firestore is not designed for complex `GROUP BY` and `SUM` operations, **Google Cloud BigQuery** is built for exactly this purpose.

We will leverage the official **Firebase Extension: Stream Collections to BigQuery** to create a real-time, read-only replica of our financial data in BigQuery. Our application will then run a single, powerful SQL query against BigQuery to get the pre-aggregated data for the dashboard.

### Benefits of this Approach:

- **Massive Performance Gain:** Replaces hundreds of Firestore reads with a single, highly optimized BigQuery query.
- **Eliminates Resource Exhaustion:** The application's memory and bandwidth usage will be minimal, as it will only fetch a small, pre-aggregated result set.
- **Scalability:** BigQuery is designed to handle massive datasets, ensuring the dashboard remains fast and reliable as the number of residents and transactions grows.
- **Separation of Concerns:** The application server is no longer responsible for heavy data processing, which is offloaded to a dedicated analytics engine.

---

## 3. Implementation Plan

### Phase 1: Infrastructure Setup

1.  **Install the BigQuery Extension:**
    - From the Firebase console, install the **[Stream Collections to BigQuery](https://firebase.google.com/products/extensions/firestore-bigquery-export)** extension.
    - Configure the extension to monitor the following collections: `charges`, `claims`, `payments`, `adjustments`, and `residents` (for the `created_at` field).
    - This will create corresponding tables in a new BigQuery dataset (e.g., `firestore_export`).

2.  **Create a BigQuery Client:**
    - A file at `lib/bigquery.ts` will be created to instantiate and export a singleton BigQuery client, similar to the Firestore admin client.

### Phase 2: Backend Refactoring

1.  **Create the Aggregation SQL Query:**
    - A new file, `lib/bigquery/queries.ts`, will be created to house the SQL query.
    - The query will perform the following actions:
      - `UNION ALL` the `charges`, `claims`, `payments`, and `adjustments` tables.
      - `GROUP BY` date.
      - `SUM()` the amounts for each financial type.
      - The query will be parameterized to accept a time range.

2.  **Rewrite `getChartData`:**
    - The `getChartData` function in `app/admin/dashboard/page.tsx` will be completely rewritten.
    - It will no longer call `getAllResidents` or `getNestedResidentData`.
    - Instead, it will call the BigQuery client, execute the aggregation SQL query, and return the formatted results.
    - A similar query will be written to calculate user growth based on the `residents` table in BigQuery.

### Phase 3: Frontend (No Changes Needed)

The frontend components (`DashboardClient`, `SectionCards`, `ChartAreaInteractive`) will require **no changes**. They will continue to receive the `FormattedChartData` and `residents` props as they do now, but the data will be sourced from BigQuery instead of Firestore.
