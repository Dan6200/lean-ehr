export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FB_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FB_STORAGE_BUCKET,
  appId: process.env.NEXT_PUBLIC_FB_APP_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FB_MESSAGING_SENDER_ID,
}

// This is the configuration for the Firebase Admin SDK
export const adminConfig = {
  projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID,
  // In a GCP environment (like Cloud Run), the service account is auto-discovered.
  // For local development, you must set the GOOGLE_APPLICATION_CREDENTIALS env var.
  // credential: admin.credential.applicationDefault()
}
