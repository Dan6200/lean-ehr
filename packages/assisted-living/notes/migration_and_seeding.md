# Data Migration and Seeding Process

This document outlines the process for seeding a new Firestore environment (like development, staging, or production) with the encrypted demo data.

The process is containerized using Docker and run as a one-off task on Google Cloud Run.

## Architecture Overview

- **`demo-data/`**: This directory contains the plaintext JSON data and the `upload.sh` script.
- **`dev-utils/encrypt-resident-data.ts`**: A Node.js script that reads the plaintext data, encrypts it using KMS, and generates a single `firestore-encrypted-payload.jsonl` file.
- **`firestore-cli`**: A command-line tool used to perform a high-performance bulk upload of the `.jsonl` payload to Firestore.
- **`Dockerfile`**: Defines a container image that includes all necessary scripts and dependencies (`firebase-tools`, `firestore-cli`).
- **Cloud Run Job**: A serverless, container-based job used to execute the upload process in the cloud.

## Seeding Process Steps

### 1. Securely Store the Service Account Key (One-Time Setup)

To avoid embedding secret keys in the Docker image, we store the service account key in Google Cloud Secret Manager and mount it into the Cloud Run job at runtime.

```bash
# 1. Enable the Secret Manager API
gcloud services enable secretmanager.googleapis.com --project=lean-ehr

# 2. Create a secret to hold the key
gcloud secrets create assisted-living-app-key --replication-policy="automatic" --project=lean-ehr

# 3. Add the key file content as a secret version
gcloud secrets versions add assisted-living-app-key --data-file="secret-key/assisted-living-app-key.json" --project=lean-ehr
```

### 2. Prepare the Data (Local)

If you have made changes to the plaintext data in the `demo-data` directory, you must re-run the encryption script locally first.

```bash
# Make sure NODE_ENV is set if your script depends on it
export NODE_ENV=development
node ./dev-utils/encrypt-resident-data.ts
```

This will update the `demo-data/firestore-encrypted-payload.jsonl` file.

### 3. Build and Push the Docker Image

Build the Docker image and push it to Google Artifact Registry. This command builds the image and tags it with the correct repository path in one step.

```bash
# Authenticate Docker with gcloud (only needed once per session)
gcloud auth configure-docker europe-west1-docker.pkg.dev

# Build and push
docker build -t europe-west1-docker.pkg.dev/lean-ehr/lean-ehr-repo/lean-ehr-uploader:latest . && \
docker push europe-west1-docker.pkg.dev/lean-ehr/lean-ehr-repo/lean-ehr-uploader:latest
```

### 4. Deploy the Cloud Run Job with Secret

This step defines the job on Cloud Run, setting the container image, memory, timeout, and mounting the secret.

```bash
gcloud run jobs deploy lean-ehr-data-upload \
  --image europe-west1-docker.pkg.dev/lean-ehr/lean-ehr-repo/lean-ehr-uploader:latest \
  --memory 4Gi \
  --task-timeout 10800 \
  --max-retries 0 \
  --update-secrets=/app/secret-key/assisted-living-app-key.json=assisted-living-app-key:latest \
  --region europe-west1 \
  --project lean-ehr
```

### 5. Execute the Job

This command starts the job. It will pull the latest version of your container image and run the `upload.sh` script inside it.

```bash
gcloud run jobs execute lean-ehr-data-upload --region europe-west1 --project lean-ehr
```

### 6. Monitor the Job

You can monitor the job's progress and view its logs in the Google Cloud Console under **Cloud Run > Jobs > lean-ehr-data-upload**.

```

```
