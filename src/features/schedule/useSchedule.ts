import { User } from "@/features/users/User";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { where } from "firebase/firestore";
import { Schedule } from "./Schedule";

export function useSchedules() {
  const { fetchItems } = useFirestoreCollection<Schedule>({
    collectionName: "schedules",
    defaultFilters: [where("active", "==", true)],
  });

  const fetchScheduleAsync = () => {
    return fetchItems();
  };

  return { fetchScheduleAsync };
}
