# IAM Setup Guide for Emergency "Break-Glass" Access

This document provides the Google Cloud IAM and KMS commands required to configure the "First Responder / EMS" emergency access feature. This setup enables secure, short-lived, and audited access to sensitive patient data in an emergency.

---

## Strategy Overview

The goal is to grant a "First Responder" temporary, read-only access to decrypt data protected by the `kek-contact` and `kek-clinical` keys. We achieve this by creating a special, highly-privileged service account that the application can **impersonate** for a short time after a user passes an emergency authentication check.

This involves four main steps:

1.  **Create a Custom IAM Role:** A role with the single, specific permission to decrypt.
2.  **Create a Dedicated Service Account:** An identity that will be temporarily "assumed" during an emergency.
3.  **Bind the Role to the Service Account for Specific Keys:** Grant the decryption permission only on the necessary KEKs.
4.  **Allow the App to Impersonate the Service Account:** Permit the main application to generate short-lived tokens for the emergency account.

---

## Prerequisites

This guide assumes you have already created the following resources as documented in `gcloud_setup.md`:

1.  A Google Cloud Project (e.g., `lean-ehr`).
2.  A KMS Key Ring (e.g., `assisted-living` in `europe-west1`).
3.  The following Key Encryption Keys (KEKs): `kek-contact` and `kek-clinical`.
4.  A main service account for the application backend (e.g., `app-backend-sa`).

---

## Step 1: Create the Custom IAM Role for Emergency Decryption

First, create a custom IAM role that contains only the permission to use a KMS key for decryption. This adheres to the principle of least privilege.

```bash
# Replace [PROJECT_ID] with your actual GCP Project ID
PROJECT_ID="lean-ehr"

gcloud iam roles create ems_decrypter --project="${PROJECT_ID}" \
  --title="EMS Decrypter" \
  --description="Grants permission to use KMS keys for emergency decryption" \
  --permissions="cloudkms.cryptoKeyVersions.useToDecrypt"
```

## Step 2: Create a Dedicated "First Responder" Service Account

Next, create a new service account that will be the identity assumed during an emergency. No one will have permanent credentials for this account.

```bash
# Replace [PROJECT_ID] with your actual GCP Project ID
PROJECT_ID="lean-ehr"

gcloud iam service-accounts create ems-responder-sa \
  --project="${PROJECT_ID}" \
  --display-name="Emergency Medical Services Responder Service Account"
```

## Step 3: Bind the Custom Role to the Service Account for Specific Keys

This is the most critical security step. Grant the `ems_decrypter` role to the `ems-responder-sa` service account, but **only on the specific KEKs** it is allowed to use.

```bash
# Replace [PROJECT_ID] with your actual GCP Project ID
PROJECT_ID="lean-ehr"
KEYRING="assisted-living"
LOCATION="europe-west1"
RESPONDER_SA="ems-responder-sa@${PROJECT_ID}.iam.gserviceaccount.com"
DECRYPTER_ROLE="projects/${PROJECT_ID}/roles/ems_decrypter"

# Grant emergency access to the CLINICAL key
gcloud kms keys add-iam-policy-binding kek-clinical \
  --keyring="${KEYRING}" \
  --location="${LOCATION}" \
  --project="${PROJECT_ID}" \
  --member="serviceAccount:${RESPONDER_SA}" \
  --role="${DECRYPTER_ROLE}"

# Grant emergency access to the CONTACT key
gcloud kms keys add-iam-policy-binding kek-contact \
  --keyring="${KEYRING}" \
  --location="${LOCATION}" \
  --project="${PROJECT_ID}" \
  --member="serviceAccount:${RESPONDER_SA}" \
  --role="${DECRYPTER_ROLE}"
```

**Result:** The `ems-responder-sa` service account now has the power to decrypt with `kek-clinical` and `kek-contact`, and nothing else.

## Step 4: Allow the Application to Impersonate the Responder Service Account

The final step is to allow your main application's service account to generate short-lived credentials for the `ems-responder-sa`. This is done by granting your app's service account the **`iam.serviceAccountTokenCreator`** role on the `ems-responder-sa`.

```bash
# Replace [PROJECT_ID] with your actual GCP Project ID
PROJECT_ID="lean-ehr"

# The service account for your main application backend
APP_SA="assisted-living-app@${PROJECT_ID}.iam.gserviceaccount.com"

# The service account for the emergency responder role
RESPONDER_SA="ems-responder-sa@${PROJECT_ID}.iam.gserviceaccount.com"

gcloud iam service-accounts add-iam-policy-binding \
  "${RESPONDER_SA}" \
  --project="${PROJECT_ID}" \
  --member="serviceAccount:${APP_SA}" \
  --role="roles/iam.serviceAccountTokenCreator"
```

## Summary of the Access Flow

1.  A first responder authenticates and triggers the "break-glass" workflow in the application.
2.  The backend (running as `assisted-living-app-sa`) verifies the user and justification.
3.  The backend calls the Google Auth library to generate a short-lived (e.g., 15-minute) access token for the `ems-responder-sa`.
4.  This temporary token is used to call the Cloud KMS API.
5.  KMS verifies that the token is for `ems-responder-sa`, checks that the role has `useToDecrypt` permission on the requested KEK, and confirms the token is not expired.
6.  Decryption succeeds.
7.  After 15 minutes, the token expires, and access is automatically revoked.
