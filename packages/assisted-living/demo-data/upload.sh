#!/bin/bash

# Development
# firestore-cli set providers/GYRHOME/facilities -b -f demo-data/facilities/data.json
#
# jq -r --arg providers "GYRHOME" '
# .[] | "firestore-cli set providers/\($providers)/residents \(tojson | @sh)"
# ' demo-data/residents/data.json |
# parallel -j 4 '{}'

# Production
firestore-cli set providers/GYRHOME/facilities -b -f demo-data/facilities/data.json -k secret-key/assisted-living-app-key.json 

jq -r --arg providers "GYRHOME" '
.[] | "firestore-cli set providers/\($providers)/residents -k secret-key/assisted-living-app-key.json \(tojson | @sh)"
' demo-data/residents/data.json |
parallel -j 4 '{}'
