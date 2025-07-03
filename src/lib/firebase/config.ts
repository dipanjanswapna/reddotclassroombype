
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAntk2yVUghwJzR_DmSEHmGqrY5qrUfEpo",
  authDomain: "rdcshop-53819.firebaseapp.com",
  projectId: "rdcshop-53819",
  storageBucket: "rdcshop-53819.appspot.com",
  messagingSenderId: "497795678957",
  appId: "1:497795678957:web:10f8842d18f171573402e4",
  measurementId: "G-HL320LVFPT"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
