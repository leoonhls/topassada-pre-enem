import { getApp, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { collection, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(getApp());
const storage = getStorage(app);

const usersCollection = collection(db, "/users");
const logsCollection = collection(db, "/logs");
const professorsCollection = collection(db, "professors");
const subjectsCollection = collection(db, "subjects");
const schedulesCollection = collection(db, "schedules");
const presencesCollection = collection(db, "presences");

export {
  app,
  auth,
  db,
  firebaseConfig,
  storage,
  usersCollection,
  logsCollection,
  professorsCollection,
  subjectsCollection,
  schedulesCollection,
  presencesCollection,
};
