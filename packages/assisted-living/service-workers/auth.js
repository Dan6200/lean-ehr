// service-workers/auth.js
// This service worker intercepts fetch requests to append Firebase Auth ID tokens
// to headers for SSR authentication.

import { initializeApp, getApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// Firebase client configuration - these values are public and can be hardcoded here.
// They should match the firebaseConfig in firebase/auth/client/config.ts
const firebaseConfig = {
  apiKey: 'AIzaSyDqWwBZVVjvnI-GgL8gzKW5N7q_oOSdBuQ',
  authDomain: 'lean-ehr.firebaseapp.com',
  projectId: 'lean-ehr',
  storageBucket: 'lean-ehr.firebasestorage.app',
  appId: '1:31765765651:web:a24a23e659b9377689e9e6',
  messagingSenderId: '31765765651',
}

// Initialize Firebase app in the service worker if not already initialized
// This ensures the Firebase client SDK is ready to provide auth tokens.
let firebaseApp
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig)
} else {
  firebaseApp = getApp()
}

const getOriginFromUrl = (url) => {
  const pathArray = url.split('/')
  const protocol = pathArray[0]
  const host = pathArray[2]
  return protocol + '//' + host
}

// Helper to get request body for non-GET requests
const getBodyContent = (req) => {
  return new Promise((resolve) => {
    if (req.method !== 'GET') {
      req
        .clone()
        .text()
        .then(resolve)
        .catch(() => resolve(undefined))
    } else {
      resolve(undefined)
    }
  })
}

self.addEventListener('fetch', (event) => {
  const evt = event

  // Only intercept requests to your own origin that are for HTML documents (SSR requests)
  if (
    evt.request.mode === 'navigate' &&
    evt.request.destination === 'document' &&
    evt.request.url.startsWith(self.location.origin)
  ) {
    evt.respondWith(
      (async function () {
        const auth = getAuth(firebaseApp)
        const user = auth.currentUser
        let idToken = null

        if (user) {
          try {
            // Get the ID token, refreshing it if necessary
            idToken = await user.getIdToken(true) // `true` forces a refresh
          } catch (error) {
            console.error('Service Worker: Failed to get ID token:', error)
          }
        }

        let req = evt.request
        if (idToken) {
          // Clone headers as request headers are immutable.
          const headers = new Headers()
          req.headers.forEach((val, key) => {
            headers.append(key, val)
          })
          // Add ID token to header.
          headers.append('Authorization', `Bearer ${idToken}`)

          // Recreate the request with the new headers and potentially the body
          try {
            const body = await getBodyContent(req)
            req = new Request(req.url, {
              method: req.method,
              headers: headers,
              mode: 'same-origin',
              credentials: req.credentials,
              cache: req.cache,
              redirect: req.redirect,
              referrer: req.referrer,
              body: body || null, // body can be null for GET/HEAD
            })
          } catch (e) {
            console.error(
              'Service Worker: Failed to create new Request with body',
              e,
            )
            // Fallback to original request if body processing fails
            req = evt.request
          }
        }

        // Proceed with the (potentially modified) request
        return fetch(req)
      })(),
    )
  }
})

// Activate event listener for the service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})
