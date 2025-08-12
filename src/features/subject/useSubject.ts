import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { where } from "firebase/firestore";
import { Subject } from "./Subject";

export function useSubjects() {
  const { fetchItems } = useFirestoreCollection<Subject>({
    collectionName: "subjects",
    fieldsToCapitalize: ["name"],
    defaultFilters: [where("active", "==", true)],
  });

  const fetchSubjectAsync = () => {
    return fetchItems();
  };

  return { fetchSubjectAsync };
}
