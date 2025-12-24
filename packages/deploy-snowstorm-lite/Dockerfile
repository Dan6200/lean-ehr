# ----------------------------------------------------
# STAGE 1: Build & Data Fetch
# ----------------------------------------------------
FROM google/cloud-sdk:slim AS builder

ENV SNOWSTORM_VERSION=2.3.1
ENV JAR_FILE=snowstorm-lite-${SNOWSTORM_VERSION}.jar
ENV BUCKET_NAME=lean-ehr-loinc-data-7776
ENV RF2_PREFIX=snomed-packages/
ENV RF2_FILENAME=uk_sct2cl_41.0.0_20250924000001Z.zip 

WORKDIR /app

# Download JAR
RUN curl -L -o ${JAR_FILE} \
    "https://github.com/IHTSDO/snowstorm-lite/releases/download/${SNOWSTORM_VERSION}/${JAR_FILE}"

# Download Large RF2 file
RUN --mount=type=secret,id=gcp_creds \
		export GOOGLE_APPLICATION_CREDENTIALS=/run/secrets/gcp_creds && \
		gcloud auth activate-service-account --key-file=$GOOGLE_APPLICATION_CREDENTIALS && \
		mkdir -p input-rf2 && \
    gsutil cp gs://${BUCKET_NAME}/${RF2_PREFIX}${RF2_FILENAME} input-rf2/

# ----------------------------------------------------
# STAGE 2: Runtime Image (The Lean EHR Terminology Server)
# ----------------------------------------------------
FROM eclipse-temurin:17-jre-jammy

# Redefine ARGs/ENVs needed in Stage 2 (Stage 1 variables don't carry over automatically)
ENV JAR_FILE=snowstorm-lite-2.3.1.jar
ENV RF2_FILENAME=uk_sct2cl_41.0.0_20250924000001Z.zip
ENV RF2_FILE=/app/input-rf2/${RF2_FILENAME}

# Fix Permissions & Warnings
RUN groupadd -g 1001 install && \
    useradd -u 1001 -g install -m -s /bin/bash snowstorm

WORKDIR /app

# Copy files and CHANGE OWNERSHIP immediately
# Without --chown, the files are owned by root, and 'snowstorm' won't be able to index them
COPY --from=builder --chown=snowstorm:install /app/${JAR_FILE} .
COPY --from=builder --chown=snowstorm:install /app/input-rf2 ./input-rf2

USER snowstorm

ENV SNOWSTORM_PORT=8080
ENV VERSION_URI=http://snomed.info/sct/900000000000207008/version/20250924

EXPOSE ${SNOWSTORM_PORT}

# Use a Shell script approach or a single exec for CMD to avoid variable expansion issues
# Note: Snowstorm-lite creates a 'data' folder for its Lucene index. 
# It MUST be writable by the 'snowstorm' user.
CMD ["sh", "-c", "java -Xmx1G -jar ${JAR_FILE} --load=${RF2_FILE} --version-uri=${VERSION_URI} && exec java -Xmx1G -jar ${JAR_FILE}"]
