import { User } from "@/features/users/User";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { where } from "firebase/firestore";
import { Professor } from "./Professor";

export function useProfessors() {
  const { fetchItems } = useFirestoreCollection<Professor>({
    collectionName: "professors",
    fieldsToCapitalize: ["name"],
    defaultFilters: [where("active", "==", true)],
  });

  const fetchProfessorAsync = () => {
    return fetchItems();
  };

  return { fetchProfessorAsync };
}
