#!/bin/bash

firestore-cli set providers/GYRHOME/facilities -b -f facilities/data.json

jq -r --arg providers "GYRHOME" '
  .[] |
  "firestore-cli set providers/\($providers)/facilities/\(.data.residence_id)/residents/\(.data.resident_id) \(.data | tojson | @sh)"
' residents/data.json |
parallel -j 4 '{}' 1>> upload.log 2>> error.log