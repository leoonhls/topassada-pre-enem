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

const tsiCollection = collection(db, "/tsi");
const productionsCollection = collection(db, "/productions");

const productsCollection = collection(db, "/products");
const suppliersCollection = collection(db, "/suppliers");
const clientsCollection = collection(db, "/clients");
const intermediaryCollection = collection(db, "/intermediaries");
const purchasesCollection = collection(db, "/purchases");
const stockCollection = collection(db, "/stock");
const usersCollection = collection(db, "/users");
const logsCollection = collection(db, "/logs");
const installmentsCollection = collection(db, "/installments");
const salesCollection = collection(db, "/sales");
const exchangesCollection = collection(db, "/exchanges");
const commissionsCollection = collection(db, "/commissions");

export {
  app,
  auth,
  db,
  firebaseConfig,
  productsCollection,
  purchasesCollection,
  stockCollection,
  storage,
  suppliersCollection,
  clientsCollection,
  tsiCollection,
  usersCollection,
  intermediaryCollection,
  logsCollection,
  installmentsCollection,
  salesCollection,
  exchangesCollection,
  commissionsCollection,
  productionsCollection,
};
