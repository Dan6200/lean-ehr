// This file centralizes KEK paths to be used by server-side code and Firebase Functions.
// KEK paths are always read from process.env, as they are expected to be set
// in deployed environments (Server Actions, Functions).

// IMPORTANT: These environment variables must be configured during deployment
// (e.g., via firebase functions:config:set or gcloud run jobs deploy --set-env-vars).

export const KEK_GENERAL_PATH = process.env.KEK_GENERAL_PATH!
export const KEK_CONTACT_PATH = process.env.KEK_CONTACT_PATH!
export const KEK_CLINICAL_PATH = process.env.KEK_CLINICAL_PATH!
export const KEK_FINANCIAL_PATH = process.env.KEK_FINANCIAL_PATH!

// Add other KEKs here if needed
// export const KEK_RESPONDER_PATH = process.env.KEK_RESPONDER_PATH!

if (
  !KEK_GENERAL_PATH ||
  !KEK_CONTACT_PATH ||
  !KEK_CLINICAL_PATH ||
  !KEK_FINANCIAL_PATH
) {
  console.warn(
    'One or more KEK_PATH environment variables are not set. Decryption/Encryption may fail in deployed environments if these are not explicitly provided.',
  )
}
