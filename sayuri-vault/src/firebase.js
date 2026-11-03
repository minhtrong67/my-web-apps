import { initializeApp } from 'firebase/app'
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider, signOut } from 'firebase/auth'

const e = import.meta.env
export const configured = Boolean(e.VITE_FIREBASE_API_KEY && e.VITE_FIREBASE_PROJECT_ID)
const app = configured
  ? initializeApp({
      apiKey: e.VITE_FIREBASE_API_KEY, authDomain: e.VITE_FIREBASE_AUTH_DOMAIN, projectId: e.VITE_FIREBASE_PROJECT_ID,
      storageBucket: e.VITE_FIREBASE_STORAGE_BUCKET, messagingSenderId: e.VITE_FIREBASE_MESSAGING_SENDER_ID, appId: e.VITE_FIREBASE_APP_ID,
    })
  : null
export const db = app ? initializeFirestore(app, { localCache: persistentLocalCache() }) : null
export const auth = app ? getAuth(app) : null
export const provider = new GoogleAuthProvider()
export const logout = () => signOut(auth)
export const allowedEmails = (e.VITE_ALLOWED_EMAIL || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
