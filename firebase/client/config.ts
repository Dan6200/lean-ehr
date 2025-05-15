import { getAuth } from "firebase/auth";
import { getApp, getApps, initializeApp } from "firebase/app";

const appName = "linkID-client";
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FB_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FB_STORAGE_BUCKET,
  appId: process.env.NEXT_PUBLIC_FB_APP_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FB_MESSAGING_SENDER_ID,
};

if (!getApps().find((app) => app?.name === appName))
  initializeApp(firebaseConfig, appName);
export const auth = getAuth(getApp(appName));
