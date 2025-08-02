// hooks/useFirestoreCollection.ts
import {
  getDocs,
  orderBy,
  query,
  QueryConstraint,
  startAfter,
  where,
  limit,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  getCountFromServer,
  collection,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { capitalizeWords } from "@/utils/stringUtils";

// Configuração genérica para cada tipo de coleção
interface CollectionConfig<T> {
  collectionName: string;
  pageSize?: number;
  defaultOrderBy?: {
    field: keyof T;
    direction: "asc" | "desc";
  };
  fieldsToCapitalize?: (keyof T)[];
  defaultFilters?: QueryConstraint[];
}

// Interface genérica para resposta
interface CollectionResponse<T> {
  items: T[];
  lastDoc: QueryDocumentSnapshot | null;
  hasMore: boolean;
  total: number;
  collSize: number;
}

// Hook genérico
export function useFirestoreCollection<T extends { id: string }>(
  config: CollectionConfig<T>
) {
  const {
    collectionName,
    pageSize = 6,
    defaultOrderBy = { field: "name" as keyof T },
    fieldsToCapitalize = [],
    defaultFilters = [],
  } = config;

  const fetchItems = async (
    filters: Record<string, any> = {},
    lastDoc?: DocumentSnapshot | null
  ): Promise<CollectionResponse<T>> => {
    const coll = collection(db, collectionName);

    // Array com as restrições da query
    const queryArray: QueryConstraint[] = [...defaultFilters];



    // Executa a query
    const queryRef = query(coll, ...queryArray);
    const snapshot = await getDocs(queryRef);
    const sizeCollection = await getCountFromServer(coll);

    // Converte os documentos
    const items = snapshot.docs.slice(0, pageSize).map((doc) => {
      const data = doc.data() as T;
      const processedData = { ...data, id: doc.id };

      // Aplica capitalização nos campos especificados
      fieldsToCapitalize.forEach((field) => {
        if (processedData[field] && typeof processedData[field] === "string") {
          (processedData[field] as any) = capitalizeWords(
            processedData[field] as string
          );
        }
      });

      return processedData;
    }) as T[];

    return {
      items,
      lastDoc: snapshot.docs[pageSize - 1] || null,
      hasMore: snapshot.docs.length > pageSize,
      total: snapshot.docs.length,
      collSize: sizeCollection.data().count,
    };
  };

  return { fetchItems };
}
