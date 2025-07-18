
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

function getFirebaseApp(): FirebaseApp | null {
  if (app) return app;

  // Check for configuration availability
  if (!firebaseConfig.apiKey) {
    if (typeof window === "undefined") {
      // Don't throw on server during build, but log an error.
      console.error("Firebase API Key is missing. Check your environment variables.");
    }
    // On client, or if config is missing, we cannot proceed.
    return null; 
  }

  if (getApps().length > 0) {
    app = getApp();
  } else {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

function getDbInstance(): Firestore | null {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  if (!dbInstance) {
    dbInstance = getFirestore(firebaseApp);
  }
  return dbInstance;
}

function getAuthInstance(): Auth | null {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  if (!authInstance) {
    authInstance = getAuth(firebaseApp);
  }
  return authInstance;
}

export { getDbInstance, getAuthInstance };
