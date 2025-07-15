
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

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  
  if (!firebaseConfig.apiKey) {
    throw new Error("Firebase API Key is missing. Please check your environment variables.");
  }
  
  return initializeApp(firebaseConfig);
}

function getDbInstance(): Firestore {
  if (!db) {
    app = getFirebaseApp();
    db = getFirestore(app);
  }
  return db;
}

function getAuthInstance(): Auth {
  if (!auth) {
    app = getFirebaseApp();
    auth = getAuth(app);
  }
  return auth;
}

// We are renaming the exports to db and auth for cleaner imports elsewhere.
export { getFirebaseApp as app, getDbInstance as db, getAuthInstance as auth };
