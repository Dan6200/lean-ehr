#!/bin/bash

firestore-cli set providers/GYRHOME/facilities -b -f facilities/data.json

jq -r --arg providers "GYRHOME" '
.[] |select(.data.facility_id?)|
  "firestore-cli set providers/\($providers)/facilities/\(.data.facility_id)/residents \(tojson | @sh)"
' residents/data.json |
parallel -j 4 '{}' 1>> upload.log 2>> error.log
