import { capitalizeWords } from "@/utils/stringUtils";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useCallback } from "react";
import { db } from "../firebase/config";

// Cache global para armazenar documentos por coleção e ID
const globalCache: Record<string, Record<string, any>> = {};

// Função para aplicar capitalização em campos específicos baseado na coleção
const applyCapitalization = (data: any, collectionName?: string): any => {
  if (!data || typeof data !== "object") return data;

  const capitalizedData = { ...data };

  // Mapear campos por coleção que devem ser capitalizados
  const fieldsByCollection: Record<string, string[]> = {
    products: ["name", "type"],
    suppliers: ["name"],
    clients: ["name"],
    users: ["name"],
    intermediaries: ["name"],
    tsi: ["name"],
    // Campos genéricos para outras coleções
    default: [
      "name",
      "clientName",
      "supplierName",
      "productName",
      "userName",
      "type",
    ],
  };

  const fieldsToCapitalize =
    fieldsByCollection[collectionName || "default"] ||
    fieldsByCollection.default;

  fieldsToCapitalize.forEach((field) => {
    if (capitalizedData[field] && typeof capitalizedData[field] === "string") {
      capitalizedData[field] = capitalizeWords(capitalizedData[field]);
    }
  });

  return capitalizedData;
};

export function useFirebaseDocumentCache<T>(collectionName: string) {
  const getFromCacheOrFetch = useCallback(
    async (id: string, field?: string): Promise<T | null> => {
      if (!id) return null;

      // Cria o cache para a coleção se não existir
      if (!globalCache[collectionName]) {
        globalCache[collectionName] = {};
        // logCache("CREATE_COLLECTION", collectionName);
      }

      // Verifica se o documento já está em cache
      if (globalCache[collectionName][id]) {
        // logCache("HIT", collectionName, id);
        console.log("CACHE HIT " + collectionName);
        const cachedData = globalCache[collectionName][id];
        return applyCapitalization(cachedData, collectionName) as T;
      }

      // logCache("MISS", collectionName, id);
      if (!field) {
        try {
          const docRef = doc(db, collectionName, id);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const rawData = { id: docSnap.id, ...docSnap.data() };
            const data = applyCapitalization(rawData, collectionName) as T;

            // Verifica novamente antes de adicionar ao cache para evitar condições de corrida
            if (!globalCache[collectionName][id]) {
              globalCache[collectionName][id] = data;
              // logCache("ADD", collectionName, id, data);
            }

            return data;
          }
          return null;
        } catch (error) {
          console.error(
            `Erro ao buscar documento ${id} da coleção ${collectionName}:`,
            error
          );
          return null;
        }
      } else {
        try {
          // Use query and getDocs to fetch by field value

          const colRef = collection(db, collectionName);
          const q = query(colRef, where(field!, "==", id));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            const rawData = { id: docSnap.id, ...docSnap.data() };
            const data = applyCapitalization(rawData, collectionName) as T;

            // Verifica novamente antes de adicionar ao cache para evitar condições de corrida
            if (!globalCache[collectionName][id]) {
              globalCache[collectionName][id] = data;
              // logCache("ADD", collectionName, id, data);
            }

            return data;
          }
          return null;
        } catch (error) {
          console.error(
            `Erro ao buscar documento com ${field}: ${id} da coleção ${collectionName}:`,
            error
          );
          return null;
        }
      }
    },
    [collectionName]
  );

  const invalidateCache = useCallback(
    (id?: string) => {
      if (id) {
        if (globalCache[collectionName]) {
          delete globalCache[collectionName][id];
          // logCache("INVALIDATE", collectionName, id);
        }
      } else {
        delete globalCache[collectionName];
        // logCache("INVALIDATE", collectionName);
      }
    },
    [collectionName]
  );

  return {
    getFromCacheOrFetch,
    invalidateCache,
    // Expõe o cache para debug se necessário
    __debug_cache: () => globalCache[collectionName],
  };
}
