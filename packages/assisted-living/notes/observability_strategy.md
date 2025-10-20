### The MVP Observability Strategy (Deferring the Sink)

Since you are using Google Cloud (GCP) and Firestore, your application logs will naturally flow into **Google Cloud Logging (formerly Stackdriver Logging)**. This is your immediate MVP logging solution.

#### 1. What You **Must** Do Now (No Deferral)

| Requirement               | Why it's Non-Negotiable (Especially for EHR/PHI)                                                                                 | How to Do It in the MVP                                                                                                                                                  |
| :------------------------ | :------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Collect & Retain Logs** | Essential for compliance, immediate security monitoring, and debugging. If an incident happens on Day 1, you must have the logs. | Ensure your application is logging correctly to **Cloud Logging**. This happens automatically if your server (Cloud Functions, App Engine, etc.) is configured properly. |
| **Encryption**            | Logs contain PHI (via linking to user/patient IDs) and must be protected.                                                        | **Cloud Logging encrypts all logs at rest by default.** This covers your immediate encryption requirement without extra configuration.                                   |
| **Searchability**         | You must be able to search logs to troubleshoot urgent issues or investigate security alerts.                                    | Use the **Logs Explorer** (the native UI for Cloud Logging). This is sufficient for an MVP and initial audit needs.                                                      |
| **Alerting (Basic)**      | You need to know when critical errors (e.g., application crashes, authentication failures) occur.                                | Set up **basic alerts** directly in **Google Cloud Monitoring** based on log filters in Cloud Logging (e.g., `severity=ERROR`).                                          |

**Conclusion for MVP:** You do not need a Pub/Sub Sink yet. Your logs are safe, encrypted, searchable, and retainable within the standard Cloud Logging service.

---

### The Post-MVP/Scaling Strategy (The Pub/Sub Sink)

A **Log Sink** is what takes logs out of Google Cloud Logging and routes them to another destination, like **Pub/Sub**, BigQuery, or Cloud Storage.

You need a Pub/Sub Sink only when you need **real-time log processing** or **advanced routing**.

| Reason to Implement the Pub/Sub Sink (Post-MVP) | Explanation                                                                                                                                                                                                                                             | Deferral Status                                                                                                                                                                      |
| :---------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Real-Time Security/Compliance (SIEM)**        | You need to feed logs into a third-party Security Information and Event Management (SIEM) system (like Splunk, Datadog, or Google SecOps) for real-time threat detection and advanced auditing.                                                         | **Deferrable.** You don't need a full SIEM until you have a larger user base and a formal security team/requirement.                                                                 |
| **Log Transformation/Enrichment**               | You need to modify the logs (e.g., redact PHI from the log before it's archived, or enrich an entry with metadata) before it goes to its final destination. Pub/Sub acts as the trigger for a service like Cloud Functions or Dataflow to perform this. | **Deferrable.** Focus on getting clean logs first. Enrichment can wait.                                                                                                              |
| **Multi-Destination Routing**                   | You need one stream of logs to go to two different places (e.g., a copy for long-term archiving in Cloud Storage, and another copy for analysis in BigQuery).                                                                                           | **Deferrable.** For the MVP, simply retaining the logs in Cloud Logging (and/or setting up a direct sink to Cloud Storage for cost-effective long-term retention) is usually enough. |

### Final Recommendation

**✅ Defer the Pub/Sub Sink.**

Focus your energy on:

1.  **Writing high-quality, structured logs** from your application (e.g., in JSON format with fields for `user_id`, `patient_id`, and `action`).
2.  **Using Cloud Logging's native features** for immediate search and error alerting.
3.  **Setting up a simple Log Sink to a cheaper destination, like Google Cloud Storage (GCS)**, purely for HIPAA-required multi-year archiving. This is a simple one-time configuration and is often the cheapest way to meet long-term retention rules.

Once the MVP is launched and stable, you can introduce the complexity of a Pub/Sub pipeline to enable advanced real-time monitoring and third-party security tooling.
