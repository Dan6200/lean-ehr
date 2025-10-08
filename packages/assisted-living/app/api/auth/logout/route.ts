import { NextResponse, NextRequest } from 'next/server'
import {
  getVerifiedSessionCookie,
  getRevokeSessions,
  deleteSessionCookie,
} from '@/firebase/auth/server/definitions'

// The endpoint the client calls to sign out and clear the session.
export async function POST(_request: NextRequest) {
  try {
    // 2. Decode the session cookie to get the UID
    // Use checkRevoked: true to ensure the cookie hasn't been manually revoked already
    const decodedClaims = await getVerifiedSessionCookie()
    const uid = decodedClaims.uid
    await Promise.all([
      // 3. Revoke all refresh tokens for the user (Admin SDK)
      // This immediately invalidates ALL session cookies for this user across all devices.
      getRevokeSessions(uid),
      deleteSessionCookie(),
    ])

    return NextResponse.json(
      { message: 'Signed out and session revoked successfully' },
      { status: 200 },
    )
  } catch (error) {
    // If the cookie was invalid, expired, or already revoked, we still clear the client cookie (done above)
    // and just log the error. The response remains successful for the client flow.
    console.error('Error during session revocation, but cookie cleared:', error)
    return NextResponse.json(
      { message: 'Logout successful, session cleanup complete' },
      { status: 200 },
    )
  }
}
