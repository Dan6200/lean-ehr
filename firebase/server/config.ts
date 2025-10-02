import { getApp, initializeApp } from 'firebase-admin/app'
import fbAdmin from 'firebase-admin'
import { getAuth } from 'firebase-admin/auth'
import { Firestore, initializeFirestore } from 'firebase-admin/firestore'

const { credential } = fbAdmin
const appName = 'linkID-server'

let databaseId: string | undefined = undefined
if (process.env.VERCEL_ENV === 'preview') {
  databaseId = 'staging'
}

if (!fbAdmin.apps.find((app) => app?.name === appName)) {
  if (process.env.NODE_ENV === 'production') {
    // Use service account key in production
    initializeApp(
      {
        credential: credential.cert({
          projectId: process.env.FB_PROJECT_ID,
          clientEmail: process.env.FB_CLIENT_EMAIL,
          privateKey: process.env.FB_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      },
      appName,
    )
  } else {
    initializeApp(
      {
        projectId: process.env.FB_PROJECT_ID,
      },
      appName,
    )
  }
}

export const auth = getAuth(getApp(appName))
let db: Firestore
if (process.env.NODE_ENV === 'production') {
  db = databaseId
    ? initializeFirestore(getApp(appName), {}, databaseId)
    : initializeFirestore(getApp(appName), {})
} else if (process.env.FIRESTORE_EMULATOR_HOST) {
  db = databaseId
    ? initializeFirestore(
        getApp(appName),
        { host: process.env.FIRESTORE_EMULATOR_HOST, ssl: false },
        databaseId,
      )
    : initializeFirestore(getApp(appName), {
        host: process.env.FIRESTORE_EMULATOR_HOST,
        ssl: false,
      })
  console.log(
    `Server: Connected to Firestore emulator at ${process.env.FIRESTORE_EMULATOR_HOST}`,
  )
} else {
  db = databaseId
    ? initializeFirestore(getApp(appName), {}, databaseId)
    : initializeFirestore(getApp(appName), {})
  db.settings({ host: process.env.FIRESTORE_EMULATOR_HOST, ssl: false })
}
export default db
