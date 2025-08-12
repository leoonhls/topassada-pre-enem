import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
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
