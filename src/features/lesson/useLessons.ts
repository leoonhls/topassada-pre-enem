import { User } from "@/features/users/User";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { where } from "firebase/firestore";
import { Lesson } from "./Lesson";

export function useLessons() {
  const { fetchItems } = useFirestoreCollection<Lesson>({
    collectionName: "lessons",
    fieldsToCapitalize: ["name"],
    defaultFilters: [where("active", "==", true)],
  });

  const fetchLessonAsync = () => {
    return fetchItems();
  };

  return { fetchLessonAsync };
}
