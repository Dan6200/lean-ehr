import { getApp, initializeApp } from "firebase-admin/app";
import fbAdmin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { Firestore, initializeFirestore } from "firebase-admin/firestore";

const { credential } = fbAdmin;
const appName = "linkID-server";

let databaseId: string | undefined = undefined;
if (process.env.VERCEL_ENV === "preview") {
  databaseId = "staging";
}

if (!fbAdmin.apps.find((app) => app?.name === appName)) {
  if (process.env.NODE_ENV === "production") {
    // Use service account key in production
    initializeApp(
      {
        credential: credential.cert({
          projectId: process.env.FB_PROJECT_ID,
          clientEmail: process.env.FB_CLIENT_EMAIL,
          privateKey: process.env.FB_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      },
      appName,
    );
  } else {
    initializeApp(
      {
        projectId: process.env.FB_PROJECT_ID,
      },
      appName,
    );
  }
}

export const auth = getAuth(getApp(appName));
let db: Firestore;
if (process.env.NODE_ENV === "production") {
  db = databaseId
    ? initializeFirestore(getApp(appName), {}, databaseId)
    : initializeFirestore(getApp(appName), {});
} else {
  db = databaseId
    ? initializeFirestore(getApp(appName), {}, databaseId)
    : initializeFirestore(getApp(appName), {});
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    console.log(
      `Server: Connected to Firestore emulator at ${process.env.FIRESTORE_EMULATOR_HOST}`,
    );
  } else {
    console.log(
      "Server: Not connected to Firestore emulator. Ensure FIRESTORE_EMULATOR_HOST is set for emulator use.",
    );
  }
}
export default db;
