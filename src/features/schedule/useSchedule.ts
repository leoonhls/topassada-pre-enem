import { User } from "@/features/users/User";
import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { where } from "firebase/firestore";
import { Schedule } from "./Schedule";
import { DaySchedule } from "./DaySchedule";

export function useSchedules() {
  const { fetchItems } = useFirestoreCollection<DaySchedule>({
    collectionName: "schedules",
    defaultFilters: [],
  });

  const fetchScheduleAsync = () => {
    return fetchItems();
  };

  return { fetchScheduleAsync };
}
