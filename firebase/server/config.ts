import { getApp, initializeApp } from "firebase-admin/app";
import fbAdmin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { Firestore, initializeFirestore } from "firebase-admin/firestore";

const { credential } = fbAdmin;
const appName = "linkID-server";

if (!fbAdmin.apps.find((app) => app?.name === appName))
  initializeApp(
    {
      credential: credential.cert({
        projectId: process.env.FB_PROJECT_ID,
        clientEmail: process.env.FB_CLIENT_EMAIL,
        privateKey: process.env.FB_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    },
    appName
  );

export const auth = getAuth(getApp(appName));
let db: Firestore;
if (process.env.NODE_ENV === "production")
  db = initializeFirestore(getApp(appName));
else db = initializeFirestore(getApp(appName), {}, "staging");
export default db;
