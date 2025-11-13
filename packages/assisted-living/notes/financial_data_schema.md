# Financial Data Schema and Lifecycle

This document explains the structure and flow of financial data within the application, from charge generation to account balance calculation.

---

## Data Entities

The financial model is composed of five core entities, each stored in its own subcollection under a resident:

1.  **Accounts:** The central financial record for a resident. It tracks the overall balance.
2.  **Charges:** Individual line items for services or goods provided to the resident (e.g., "Monthly Rent," "Physical Therapy"). This represents the gross amount billed.
3.  **Claims:** A formal request for payment submitted to an insurance provider. A claim bundles one or more charges.
4.  **Payments:** Records of money received, either from an insurance provider (in response to a claim) or directly from the resident (out-of-pocket).
5.  **Adjustments:** The contractual "write-off" amount that is the difference between what was claimed and what an insurer paid.

---

## The Financial Lifecycle

The data generation script (`dev-utils/generators/financials.py`) simulates a standard healthcare revenue cycle. Understanding this flow is key to interpreting the data.

### Step 1: Charges are Created

- The process begins by generating several **Charges** for a resident.
- Each charge has a `unit_price` and `quantity`.
- The sum of all charges represents the total potential revenue before any payments or adjustments.

### Step 2: A Claim is Submitted

- A **Claim** is created, which bundles a _subset_ of the total charges. Not all charges are necessarily sent to an insurer; some may be intended for direct, private payment.
- The `total` of the claim is the sum of the charges it contains.

### Step 3: The Claim is Resolved (Payment & Adjustment)

- The insurance provider processes (adjudicates) the claim. They rarely pay 100% of the claimed amount.
- A **Payment** record is created to represent the amount the insurer pays. This is typically a percentage of the claim's total. The `payor` is the insurance company.
- An **Adjustment** record is created for the remaining amount. This is the contractual difference that the facility "writes off."
- **Therefore: `Claim Total` = `Payment Amount` + `Adjustment Amount`**

### Step 4: Out-of-Pocket Payments (Optional)

- The resident is responsible for any charges that were _not_ included in a claim, plus any co-pays or deductibles from the claimed charges.
- The data generator can be configured to create a second type of **Payment** record where the `payor` is the resident themselves. This represents an out-of-pocket payment.

### Step 5: The Account Balance is Calculated

- The final `balance` on the resident's **Account** is calculated as:

  ```
  Final Balance = (Total of ALL Charges) - (Total of ALL Payments) - (Total of ALL Adjustments)
  ```

- This reflects the true amount outstanding after all payments (from all sources) and all contractual write-offs have been applied.

---

## Aggregation and Reporting

When displaying this data on a dashboard, it is crucial **not to sum the different entity types together**. Adding `Charges` + `Claims` + `Payments` would be incorrect and misleading.

Instead, each entity should be tracked as a separate series over time. This allows for a clear visualization of the financial funnel:

- How much was charged?
- Of that, how much was claimed?
- Of what was claimed, how much was paid?
- How much was written off as adjustments?

This provides a much more insightful view of the facility's revenue cycle health.
