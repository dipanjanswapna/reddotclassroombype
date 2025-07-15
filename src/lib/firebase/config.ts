
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
let auth: Auth | null = null;
let db: Firestore | null = null;

function getFirebaseApp(): FirebaseApp | null {
  if (app) return app;

  if (!firebaseConfig.apiKey) {
    console.error("Firebase API Key is missing. Please check your environment variables.");
    return null;
  }
  
  if (getApps().length > 0) {
    app = getApp();
  } else {
    try {
      app = initializeApp(firebaseConfig);
    } catch (e) {
      console.error("Firebase initialization failed:", e);
      return null;
    }
  }
  return app;
}

function getDbInstance(): Firestore | null {
  if (db) return db;
  const firebaseApp = getFirebaseApp();
  if (firebaseApp) {
    db = getFirestore(firebaseApp);
    return db;
  }
  return null;
}

function getAuthInstance(): Auth | null {
  if (auth) return auth;
  const firebaseApp = getFirebaseApp();
  if (firebaseApp) {
    auth = getAuth(firebaseApp);
    return auth;
  }
  return null;
}

export { getDbInstance as db, getAuthInstance as auth };
