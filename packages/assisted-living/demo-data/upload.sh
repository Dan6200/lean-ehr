#!/bin/bash

# This script is designed for maximum upload performance by using bulk operations
# wherever possible. It pre-processes subcollection data to enable this.

# --- Configuration ---
PROVIDER_ID=${PROVIDER_ID:-"GYRHOME"}
TEMP_DIR="demo-data/tmp_split"

ENVIRONMENT="dev"
if [ "$1" == "--prod" ]; then
  ENVIRONMENT="prod"
fi

# --- Arguments Setup ---
ARGS="--rate-limit 500"
if [ "$ENVIRONMENT" == "prod" ]; then
  KEY_PATH="secret-key/assisted-living-app-key.json"
  if [ ! -f "$KEY_PATH" ]; then
    echo "Error: Production key file not found at $KEY_PATH" >&2
    exit 1
  fi
  ARGS="-k $KEY_PATH $ARGS"
  echo "Using production key: $KEY_PATH"
fi

# --- Subcollection Definitions ---
SUBCOLLECTIONS=(
  "emergency_contacts"
  "allergies"
  "prescriptions"
  "observations"
  "diagnostic_history"
  "financials"
  "prescription_administration"
)

# --- 1. Pre-processing Step: Split JSON files by resident_id ---
# echo "--- Step 1: Pre-processing subcollection data... ---"
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

for SUB in "${SUBCOLLECTIONS[@]}"; do
  DATA_FILE="demo-data/$SUB/data.json"
  if [ -f "$DATA_FILE" ]; then
    echo "Splitting $SUB..."
    mkdir -p "$TEMP_DIR/$SUB"
    # For each item in the array, append it to a new file named after its resident_id
    jq -c '.[]' "$DATA_FILE" | while read -r item;
 do
      RESIDENT_ID=$(echo "$item" | jq -r '.data.resident_id')
      # The output is JSONL (JSON Lines), one object per line
      echo "$item" >> "$TEMP_DIR/$SUB/$RESIDENT_ID.jsonl"
    done
  fi
done

# Convert all JSONL files to proper JSON arrays for bulk upload
echo "Converting temporary files to JSON format..."
for SUB in "${SUBCOLLECTIONS[@]}"; do
echo "$TEMP_DIR/$SUB"
	find "$TEMP_DIR/$SUB" -name "*.jsonl" -print0 | while IFS= read -r -d '' file;
	 do
		jq -s '.' "$file" > "${file%.jsonl}.json"
		rm "$file"
	done
done

# --- 2. Main Upload Logic ---
echo "\n--- Step 2: Starting Firestore uploads ---"

# Bulk upload facilities
echo "Uploading facilities..."
firestore-cli set "providers/$PROVIDER_ID/facilities" -b -f demo-data/facilities/data.json $ARGS

# Bulk upload residents (This is much faster)
echo "Uploading residents..."
firestore-cli set "providers/$PROVIDER_ID/residents" -b -f "demo-data/residents/data.json" $ARGS

# Get a list of all resident IDs to loop through
RESIDENT_IDS=$(jq -r '.[].id' demo-data/residents/data.json)

# Loop through each resident and bulk-upload their subcollections in parallel
echo "Uploading all subcollections for all residents in parallel..."
for RESIDENT_ID in $RESIDENT_IDS; do
    for SUB in "${SUBCOLLECTIONS[@]}"; do
      RESIDENT_FILE="$TEMP_DIR/$SUB/$RESIDENT_ID.json"
      if [ -f "$RESIDENT_FILE" ]; then
        COLLECTION_PATH="providers/$PROVIDER_ID/residents/$RESIDENT_ID/$SUB"
        echo "Uploading $SUB for resident $RESIDENT_ID..."
        firestore-cli set "$COLLECTION_PATH" -b -f "$RESIDENT_FILE" $ARGS
      fi
    done
done

# --- 3. Wait and Cleanup ---
echo "\n--- Step 3: Waiting for all uploads to complete ---"
# wait

echo "Cleaning up temporary files..."
echo "Dry run complete. Inspect the temporary files in the $TEMP_DIR directory."
rm -rf "$TEMP_DIR"
