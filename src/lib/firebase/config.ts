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

// This function ensures that the Firebase app is initialized only once.
function getFirebaseApp() {
    if (!firebaseConfig.apiKey) {
        throw new Error("Firebase API Key is missing. Please check your environment variables.");
    }
    
    if (getApps().length > 0) {
        return getApp();
    }
    return initializeApp(firebaseConfig);
}

try {
    app = getFirebaseApp();
    auth = getAuth(app);
    db = getFirestore(app);
} catch (error) {
    console.error("Firebase initialization failed during module load:", (error as Error).message);
    // Gracefully handle the error for environments where config might not be immediately available
    // The services will be lazy-initialized on first use.
}


// Lazy-load services to ensure config is available
function getDbInstance() {
    if (!db) {
        const appInstance = getFirebaseApp();
        db = getFirestore(appInstance);
    }
    return db;
}

function getAuthInstance() {
    if (!auth) {
        const appInstance = getFirebaseApp();
        auth = getAuth(appInstance);
    }
    return auth;
}

// We are renaming the exports to db and auth for cleaner imports elsewhere.
export { app, getDbInstance as db, getAuthInstance as auth };