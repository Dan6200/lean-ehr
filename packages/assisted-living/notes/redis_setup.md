# Google Cloud Memorystore (Redis) & VPC Setup

To enable your Cloud Run application to connect to a private Redis instance, we use **Direct VPC Egress**.

## 1. Enable Required APIs

```bash
gcloud services enable redis.googleapis.com --project=lean-ehr
```

## 2. Create the Redis Instance

This creates a basic Redis instance in your region.

```bash
gcloud redis instances create lean-ehr-redis \
  --size=1 \
  --region=europe-west1 \
  --zone=europe-west1-b \
  --tier=BASIC \
  --project=lean-ehr
```

- **Note:** After creation, run `gcloud redis instances describe lean-ehr-redis --region=europe-west1 --project=lean-ehr` to find the `host` (IP address) and `port`. You will need these for your GitHub Secrets (`REDIS_HOST`, `REDIS_PORT`).

## 3. Configure Direct VPC Egress (Cloud Run)

Instead of creating a separate connector resource, we configure the Cloud Run service to attach directly to the VPC network.

This is handled in the deployment command (or `deploy-app.yml` workflow) using the following flags:

```bash
--network=default \
--subnet=default \
--vpc-egress=private-ranges-only
```

- **`--network`**: The VPC network to connect to (usually `default`).
- **`--subnet`**: The subnet within that network (usually `default` for the region).
- **`--vpc-egress`**: Controls what traffic goes through the VPC. `private-ranges-only` ensures internal traffic (like Redis) goes to the VPC, while public traffic (like BigQuery/KMS) goes through the internet (via Cloud NAT, if configured).

## 4. Ensure Internet Access (Cloud NAT)

Since the service is connected to a private VPC, it needs a **Cloud NAT** gateway to access public Google APIs (like BigQuery and KMS). Ensure you have set up Cloud NAT as documented in `notes/vpc_networking_setup.md`.
