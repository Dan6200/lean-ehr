#!/bin/bash

# --- Configuration ---
# Set the provider ID from an environment variable, with "GYRHOME" as the default.
PROVIDER_ID=${PROVIDER_ID:-"GYRHOME"}

# Check for a --prod flag to determine which environment to target.
ENVIRONMENT="dev"
if [ "$1" == "--prod" ]; then
  ENVIRONMENT="prod"
fi

# --- Main Logic ---
echo "Starting upload for provider: $PROVIDER_ID in $ENVIRONMENT mode."

# Default firestore-cli command arguments
ARGS=""

# If in production mode, add the service account key to the arguments
if [ "$ENVIRONMENT" == "prod" ]; then
  KEY_PATH="secret-key/assisted-living-app-key.json"
  if [ ! -f "$KEY_PATH" ]; then
    echo "Error: Production key file not found at $KEY_PATH" >&2
    exit 1
  fi
  ARGS="-k $KEY_PATH"
  echo "Using production key: $KEY_PATH"
fi

# Upload facilities data
echo "Uploading facilities..."
# The `eval` command is used to correctly handle the expansion of ARGS, which might be empty
eval firestore-cli set "providers/$PROVIDER_ID/facilities" -b -f demo-data/facilities/data.json $ARGS

# Upload residents data in parallel
echo "Uploading residents..."
jq -r --arg providers "$PROVIDER_ID" --arg args "$ARGS" \
  '.[] | "firestore-cli set providers/\($providers)/residents \($args) (tojson | @sh)"' \
  demo-data/residents/data.json | \ 
  parallel -j 4 '{}'

echo "Upload complete."