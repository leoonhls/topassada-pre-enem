import { doc, setDoc, Timestamp } from "firebase/firestore";
import { auth, logsCollection } from "./config";

export const HandleLog = async ({ logMessage }: { logMessage: string }) => {
  try {
    // Cria uma referência de documento com ID automático
    const docRef = doc(logsCollection); // Gera uma referência com ID único
    const newLog = {
      createdAt: Timestamp.now(),
      message: logMessage,
      user: auth.currentUser?.uid, // Usa o mesmo ID do documento
    };

    await setDoc(docRef, newLog);
  } catch (error) {
    console.error("Erro:", error);
  }
};
