import { initializeApp } from "firebase/app";
import { initializeFirestore, collection, addDoc, getDocs, onSnapshot, query, orderBy, doc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import firebaseConfig from "../firebase-applet-config.json";

let db: any = null;
let auth: any = null;
let isFirebaseAvailable = false;

try {
  const app = initializeApp({
    apiKey: firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId,
  });

  // Since we have a custom databaseId in firebase-applet-config.json, we must pass it
  db = initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId || "(default)");
  auth = getAuth(app);
  isFirebaseAvailable = true;
  console.log("Firebase initialized successfully with database ID:", firebaseConfig.firestoreDatabaseId);
} catch (error) {
  console.error("Firebase failed to initialize, falling back to localStorage:", error);
}

export { db, auth, isFirebaseAvailable };
