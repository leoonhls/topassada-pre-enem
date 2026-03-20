import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { where } from "firebase/firestore";
import { User } from "./User";

export function useUsers() {
  const { fetchItems } = useFirestoreCollection<User>({
    collectionName: "users",
    fieldsToCapitalize: ["name"],
    defaultFilters: [where("active", "==", true)],
    pageSize: 500,
  });

  const fetchUserAsync = () => {
    return fetchItems();
  };

  return { fetchUserAsync };
}
