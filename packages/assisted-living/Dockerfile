FROM node:20-slim

WORKDIR /app

RUN for i in 1 2 3 4 5; do npm install -g firebase-tools firestore-cli && break || sleep 5; done

COPY demo-data/facilities/ ./demo-data/facilities/
COPY demo-data/firestore-encrypted-payload.jsonl ./demo-data/
COPY demo-data/upload.sh ./demo-data/
COPY secret-key/ ./secret-key
COPY firebase.json .
COPY .firebaserc .
COPY firestore.indexes.json .
COPY firestore.rules .

# Make the upload script executable
RUN chmod +x ./demo-data/upload.sh

# Set the entrypoint to the upload script
ENTRYPOINT ["./demo-data/upload.sh", "--prod"]
