import { User } from "@/features/users/User";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { where } from "firebase/firestore";

export function useUsers() {
  const { fetchItems } = useFirestoreCollection<User>({
    collectionName: "users",
    pageSize: 6,
    fieldsToCapitalize: ["name"],
    defaultFilters: [where("active", "==", true)],
  });

  const fetchUsersAsync = (filters: { type?: string }, lastDoc?: any) => {
    return fetchItems(filters, lastDoc);
  };

  return { fetchUsersAsync };
}
