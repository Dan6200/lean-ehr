### The Recommended \*Legal\* Relationship Structure for Healthcare

Best practice in healthcare software is to distinguish three elements:

1.  **Scope:** Is it for health care or finance? (Required for clinical decision-making.)
2.  **Durability:** Is it durable or not? (Crucial for legal validation upon patient incapacity.)
3.  **Timing:** Is it immediate or "springing"? (Less critical for the enum, but important for document review.)

Therefore, you should combine the **Scope** and **Durability** into your enum values for the most robust data model.

| Recommended Enum Value | Description                                                                                                     | Why the distinction is crucial                                                                                               |
| :--------------------- | :-------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| **HCP_AGENT**          | **Health Care Proxy Agent** (or **POA_HEALTHCARE**). This is the person authorized to make _medical decisions_. | **CLINICALLY ESSENTIAL.** A financial POA cannot authorize surgery. This clearly defines the agent's power.                  |
| **HCP_AGENT_DURABLE**  | **Durable Health Care Proxy Agent.** The authorization remains valid even if the patient is incapacitated.      | **LEGAL & CLINICAL MUST-HAVE.** If the patient is in a coma, this is the only one that is legally valid for decision-making. |
| **POA_FINANCIAL**      | **Financial Power of Attorney.** Appointed to manage bank accounts, pay bills, etc.                             | **ADMINISTRATIVELY ESSENTIAL.** This person deals with billing and insurance, but _not_ treatment.                           |
| **GUARDIAN_OF_PERSON** | Appointed by a court to make medical and personal decisions.                                                    | **HIGHEST AUTHORITY.** Supersedes all POA documents.                                                                         |
| **GUARDIAN_OF_ESTATE** | Appointed by a court to manage the patient's finances.                                                          | Similar to Financial POA, but court-ordered.                                                                                 |

**Conclusion:** Differentiate on the nature of the power first (Health Care vs. Financial), and then ensure the durable status is captured, as durability is the key factor when the patient is in crisis.

Use the structure that clearly states **authority** (e.g., `HCP_AGENT_DURABLE`) over generic labels.

---

## Consolidated Enum Values for Healthcare Relationships

### I. Legal Agents & Court Appointments (Decision-Makers)

These roles are defined by legal documents or court orders and confer specific powers, crucial for consent and HIPAA compliance.

| Enum Value             | Description                                                                                                                             | Key Legal Distinction                         |
| :--------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------- |
| **HCP_AGENT_DURABLE**  | The legally designated **Durable Health Care Agent** (Healthcare Power of Attorney or Proxy) to make medical decisions upon incapacity. | **Highest-priority medical decision-maker.**  |
| **POA_FINANCIAL**      | **Financial Power of Attorney Agent** (Durable or General) authorized for financial matters (billing, insurance, assets).               | **Handles money, but NOT medical treatment.** |
| **GUARDIAN_OF_PERSON** | Court-appointed to make personal and medical decisions for an incapacitated patient (**Ward**).                                         | **Court-ordered authority; supersedes POA.**  |
| **GUARDIAN_OF_ESTATE** | Court-appointed to manage the financial assets of the patient.                                                                          | **Court-ordered financial authority.**        |
| **TRUSTEE**            | Manages a legal trust and its assets for the patient's benefit.                                                                         | **Financial/asset management role.**          |

### II. Formal Familial Roles (Statutory Next-of-Kin)

These relationships have a statutory order of priority for notification and may hold decision-making power if no formal agent is appointed.

| Enum Value           | Description                                                                                        | Context/Need                                                                  |
| :------------------- | :------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------- |
| **SPOUSE**           | A legally married partner.                                                                         | Primary next-of-kin with rights to information and, often, to make decisions. |
| **DOMESTIC_PARTNER** | A person in a long-term, non-marital relationship that may be recognized by the employer or state. | Key contact; legal rights vary by jurisdiction.                               |
| **PARENT**           | A biological or adoptive parent.                                                                   | Decision-maker for minors; high-priority contact for adults.                  |
| **CHILD**            | A biological or adoptive adult child of the patient.                                               | Next-in-line decision-maker after a spouse/parent.                            |
| **SIBLING**          | A brother or sister.                                                                               | Next-of-kin for notification.                                                 |

### III. Informal & Support Roles (Contact and Care)

These roles do not typically confer legal decision-making power but are essential for patient care coordination and communication.

| Enum Value            | Description                                                                    | Context/Need                                                       |
| :-------------------- | :----------------------------------------------------------------------------- | :----------------------------------------------------------------- |
| **EMERGENCY_CONTACT** | The primary person designated for immediate crisis notification.               | Focus on urgent communication; can be any relationship type.       |
| **CARETAKER**         | A professional or informal person providing daily, in-home care or assistance. | Crucial source of up-to-date symptom and daily status information. |
| **FRIEND**            | A non-familial person designated for communication and emotional support.      | Common designation for non-legal support.                          |
| **OTHER_RELATIVE**    | Any other relative (grandparent, cousin, aunt/uncle, etc.).                    | Covers extended family for comprehensive record-keeping.           |

This combined enum provides the necessary granularity for legal validation, clinical workflows, and administrative functions within your healthcare application.
