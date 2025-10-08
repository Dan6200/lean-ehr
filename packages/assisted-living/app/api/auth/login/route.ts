import { NextResponse, NextRequest } from 'next/server'
import { cookies } from 'next/headers'

const SESSION_EXPIRY_MS = 3600 * 1000
const CREATE_SESSION_COOKIE_FUNCTION_URL =
  process.env.CREATE_SESSION_COOKIE_FUNCTION_URL!

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json()
    const cookieStore = await cookies()

    if (!idToken) {
      return NextResponse.json(
        { message: 'ID Token required' },
        { status: 400 },
      )
    }

    const response = await fetch(CREATE_SESSION_COOKIE_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken, expiresIn: SESSION_EXPIRY_MS }),
    })
    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.error || 'Failed to set session cookie')
    }

    const sessionCookie = result
    cookieStore.set('__session', sessionCookie, {
      maxAge: SESSION_EXPIRY_MS / 1000, // Convert MS to seconds
      httpOnly: true, // Crucial: Prevents client-side JS access (XSS mitigation)
      secure: process.env.NODE_ENV === 'production', // Use secure in production
      path: '/',
      sameSite: 'strict',
    })

    return NextResponse.json(
      { message: 'Session cookie set successfully' },
      { status: 200 },
    )
  } catch (error: any) {
    console.error(`Error calling ${CREATE_SESSION_COOKIE_FUNCTION_URL}:`, error)
    return NextResponse.json(
      { message: 'Failed to set session cookie.' },
      { status: 401 },
    )
  }
}
