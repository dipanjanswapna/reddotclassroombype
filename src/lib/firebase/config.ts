
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Singleton instances for Firebase services
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

/**
 * Initializes and returns the Firebase app instance, ensuring it's created only once.
 * This function is robust and safe for both client and server-side rendering.
 * @returns {FirebaseApp} The initialized Firebase app instance.
 */
function getFirebaseApp(): FirebaseApp {
  if (app) {
    return app;
  }

  if (getApps().length > 0) {
    app = getApp();
  } else {
    if (!firebaseConfig.apiKey) {
      throw new Error("Firebase API Key is missing. Please check your environment variables.");
    }
    app = initializeApp(firebaseConfig);
  }
  return app;
}

/**
 * Returns a singleton instance of the Firestore database.
 * Lazily initializes the Firestore service when first called.
 * @returns {Firestore} The Firestore database instance.
 */
function getDbInstance(): Firestore {
  if (!db) {
    const firebaseApp = getFirebaseApp();
    db = getFirestore(firebaseApp);
  }
  return db;
}

/**
 * Returns a singleton instance of the Firebase Auth service.
 * Lazily initializes the Auth service when first called.
 * @returns {Auth} The Firebase Auth instance.
 */
function getAuthInstance(): Auth {
  if (!auth) {
    const firebaseApp = getFirebaseApp();
    auth = getAuth(firebaseApp);
  }
  return auth;
}

// Export the getter functions for use throughout the application
export { getDbInstance as db, getAuthInstance as auth };
