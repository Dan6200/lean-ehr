# Secure Firebase Authentication Pattern for Web

This note outlines a highly secure authentication pattern for web applications using Firebase, designed to mitigate the risk of token theft via Cross-Site Scripting (XSS) attacks.

## The Problem: Default Token Persistence

By default, the Firebase client-side SDK persists authentication state (including the ID token and the powerful, long-lived Refresh Token) in the browser's `IndexedDB`. While convenient, this storage is accessible to any JavaScript running on the page. If an attacker can inject a malicious script (an XSS attack), they can potentially steal these tokens and gain full access to the user's account.

## The Solution: HttpOnly Cookies + In-Memory Persistence

A more secure architecture involves combining `HttpOnly` session cookies with a non-persistent client-side auth state.

The flow is as follows:

1.  **Client-Side Sign-In:** The user authenticates on the client as usual (e.g., with email/password). The Firebase SDK receives the ID and Refresh tokens and holds them in memory.

2.  **Mint Session Cookie:** Immediately after login, the client sends the fresh ID token to a secure, server-side endpoint (e.g., a Cloud Function). This endpoint verifies the ID token using the Firebase Admin SDK and creates a session cookie, sending it back to the client with the `HttpOnly`, `Secure`, and `SameSite=Strict` flags.

3.  **Change Client Persistence:** This is the critical step. The client-side code explicitly tells the Firebase SDK _not_ to save the tokens to `IndexedDB`. This is done by setting the persistence to in-memory.

    ```javascript
    import { getAuth, setPersistence, inMemoryPersistence } from 'firebase/auth'

    const auth = getAuth()
    setPersistence(auth, inMemoryPersistence)
    ```

    By doing this, the ID and Refresh tokens are discarded when the user navigates away or closes the tab.

4.  **Rely on the Secure Cookie:** For all subsequent server requests, the browser automatically and securely sends the `HttpOnly` session cookie. The server-side code (e.g., Next.js Server Actions) can then verify this cookie to authenticate the user for each request.

### Benefits

- **XSS Resistance:** Malicious scripts cannot access the `HttpOnly` session cookie, so the user's session cannot be hijacked.
- **No On-Disk Refresh Tokens:** The most valuable prize for an attacker—the long-lived refresh token—is never stored in the browser's persistent storage.

This pattern requires the server-side architecture we are currently implementing (i.e., the ability to handle session cookies to create authenticated app instances) to function.

---

## Architectural Decision: Server-Side Data Access

While the "Temporary Per-Request App" pattern described above is a valid way to enforce Firestore security rules on the server, its complexity can be significant, requiring careful state management (passing the `app` instance) and cleanup (`try...finally`) throughout the server-side codebase.

After consideration, a decision was made to pivot to a simpler server-side architecture:

1.  **Use the Firebase Admin SDK:** All server-side data fetching will be performed using the Firebase Admin SDK.
2.  **Bypass Security Rules:** The Admin SDK operates with privileged access, bypassing all Firestore security rules. This simplifies the code immensely as there is no need to manage per-user authentication states on the server.
3.  **Lock Down Client-Side Access:** To compensate for the server bypassing security rules, the `firestore.rules` are configured to **deny all read and write access from any client**. This ensures that the database is only accessible via the trusted server-side backend code.

This approach centralizes all data access logic on the server and relies on server-side code and endpoint security rather than Firestore rules for data protection.

---

## Addendum: Incompatibility with Service Worker Token Flow

An important consequence of adopting the `inMemoryPersistence` strategy is that it is **incompatible** with a service worker flow that relies on attaching bearer tokens to outgoing requests for persistent sessions.

- **The Conflict:** The service worker needs to ask the client-side Firebase SDK for the current user's ID token. The SDK can only do this long-term if it has a Refresh Token stored persistently.
- **The Consequence:** By using `inMemoryPersistence`, we intentionally discard the Refresh Token when the page is closed. On the next visit, the client-side SDK has no user, and the service worker cannot get an ID token.

This reinforces the architectural decision to rely **exclusively on the `HttpOnly` session cookie** for all subsequent server-side authentication after the initial login. The bearer token flow is not viable in this high-security model.
