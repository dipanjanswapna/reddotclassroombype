
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

// Hardcoded Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyAntk2yVUghwJzR_DmSEHmGqrY5qrUfEpo",
  authDomain: "rdcshop-53819.firebaseapp.com",
  projectId: "rdcshop-53819",
  storageBucket: "rdcshop-53819.appspot.com",
  messagingSenderId: "497795678957",
  appId: "1:497795678957:web:10f8842d18f171573402e4",
  measurementId: "G-HL320LVFPT"
};

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

function getFirebaseApp(): FirebaseApp | null {
  if (app) return app;

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
