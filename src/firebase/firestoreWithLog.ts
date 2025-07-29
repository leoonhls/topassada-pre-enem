import {
  addDoc,
  CollectionReference,
  deleteDoc,
  DocumentReference,
  setDoc,
  updateDoc,
  WithFieldValue,
} from "firebase/firestore";
import { HandleLog } from "./HandleLog";

export async function addDocWithLog<T>(
  colRef: CollectionReference<T>,
  data: WithFieldValue<T>,
  logMessage: string
) {
  const result = await addDoc(colRef, data);
  await HandleLog({ logMessage });
  return result;
}

export async function setDocWithLog<T>(
  docRef: DocumentReference<T>,
  data: WithFieldValue<T>,
  logMessage: string
) {
  const result = await setDoc(docRef, data);
  await HandleLog({ logMessage });
  return result;
}

export async function updateDocWithLog<T>(
  docRef: DocumentReference<T>,
  data: Partial<T>,
  logMessage: string
) {
  const result = await updateDoc(docRef, data);
  await HandleLog({ logMessage });
  return result;
}

export async function deleteDocWithLog<T>(
  docRef: DocumentReference<T>,
  logMessage: string
) {
  const result = await deleteDoc(docRef);
  await HandleLog({ logMessage });
  return result;
}
