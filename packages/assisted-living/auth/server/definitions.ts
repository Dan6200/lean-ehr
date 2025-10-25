'use server'
import {
  initializeServerApp,
  initializeApp,
  deleteApp,
  getApp,
} from 'firebase/app'
import { randomBytes } from 'crypto'
import { cookies, headers } from 'next/headers'
import { firebaseConfig } from '@/firebase/config'
import { getAuth, signInWithCustomToken } from 'firebase/auth'

// Environment variables for Cloud Function URLs
const REVOKE_SESSIONS_FUNCTION_URL = process.env.REVOKE_SESSIONS_FUNCTION_URL
const VERIFY_SESSION_COOKIE_AND_CREATE_CUSTOM_TOKEN_FUNCTION_URL =
  process.env.VERIFY_SESSION_COOKIE_AND_CREATE_CUSTOM_TOKEN_FUNCTION_URL
const VERIFY_SESSION_COOKIE_FUNCTION_URL =
  process.env.VERIFY_SESSION_COOKIE_FUNCTION_URL

/**
 * Revokes all sessions for the given user by calling a Cloud Function.
 * @param uid The user ID.
 */
export async function getRevokeSessions(uid: string) {
  try {
    if (!REVOKE_SESSIONS_FUNCTION_URL) {
      throw new Error('REVOKE_SESSIONS_FUNCTION_URL is not set.')
    }
    if (!uid) throw new Error('Must provide uid to revoke session')
    const response = await fetch(REVOKE_SESSIONS_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid }),
    })
    const result = await response.json()
    if (!response.ok) {
      throw new Error(
        result.error || 'Failed to revoke sessions via Cloud Function',
      )
    }
    console.info(`Sessions revoked for user: ${uid}`)
    return { success: true, message: 'Sessions revoked successfully.' }
  } catch (error: any) {
    console.error(`Error calling ${REVOKE_SESSIONS_FUNCTION_URL}:`, error)
    return {
      success: false,
      message: error.message || 'Failed to revoke sessions.',
    }
  }
}

/**
 * Retrieves the session cookie.
 */
export async function getSessionCookie() {
  return (await cookies()).get('__session')
}

/**
 * Deletes the session cookie and returns a NextResponse to apply the change.
 * @returns A NextResponse that clears the session cookie.
 */
export async function deleteSessionCookie(): Promise<void> {
  ;(await cookies()).delete('__session')
}

export async function getVerifiedSessionCookie(): Promise<any> {
  try {
    const sessionCookie = (await getSessionCookie())?.value
    if (!sessionCookie) return null
    if (!VERIFY_SESSION_COOKIE_FUNCTION_URL) {
      console.error('VERIFY_SESSION_COOKIE_FUNCTION_URL is not set.')
      return null
    }
    const response = await fetch(VERIFY_SESSION_COOKIE_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionCookie }),
    })
    return await response.json()
  } catch (error) {
    console.warn(
      'Session cookie verification failed via Cloud Function:',
      error,
    )
    return null
  }
}

export async function getAuthenticatedAppAndClaims(): Promise<{
  app: ReturnType<typeof initializeApp>
  idToken: any // This will be the decoded ID token
  appName: string
} | null> {
  const sessionCookie = (await cookies()).get('__session')?.value
  if (!sessionCookie) {
    // No session cookie, so no authenticated user
    return null
  }

  if (!VERIFY_SESSION_COOKIE_AND_CREATE_CUSTOM_TOKEN_FUNCTION_URL) {
    console.error(
      'VERIFY_SESSION_COOKIE_AND_CREATE_CUSTOM_TOKEN_FUNCTION_URL is not set.',
    )
    return null
  }

  try {
    const response = await fetch(
      VERIFY_SESSION_COOKIE_AND_CREATE_CUSTOM_TOKEN_FUNCTION_URL,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionCookie }),
      },
    )
    const result = await response.json()

    if (!response.ok || !result.customToken || !result.decodedClaims) {
      throw new Error(
        result.error ||
          'Failed to verify session cookie or create custom token via Cloud Function',
      )
    }

    const appName = `server-${randomBytes(16).toString('hex')}`
    const serverApp = initializeApp(firebaseConfig, appName)
    const serverAuth = getAuth(serverApp)
    await signInWithCustomToken(serverAuth, result.customToken)

    if (!serverAuth.currentUser) {
      throw new Error('FirebaseServerApp: Failed to sign in with custom token.')
    }

    return {
      app: serverApp,
      idToken: result.decodedClaims,
      appName: appName,
    }
  } catch (error: any) {
    console.error(
      'Failed to initialize Firebase app with session cookie:',
      error,
    )
    // Also, delete the potentially invalid cookie to prevent redirect loops
    await deleteSessionCookie()
    return null
  }
}

/**
 * Deletes a temporary Firebase app instance.
 * @param appName The unique name of the app to delete.
 */
export async function deleteServerApp(appName: string) {
  try {
    const app = getApp(appName)
    await deleteApp(app)
  } catch (error) {
    console.error(`Failed to delete server app ${appName}:`, error)
  }
}
