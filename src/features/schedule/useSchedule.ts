import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { DaySchedule } from "./DaySchedule";

export function useSchedules(selectedDate: Date) {
  const { fetchItems } = useFirestoreCollection<DaySchedule>({
    collectionName: "schedules",
  });

  const fetchScheduleAsync = async () => {
    const response = await fetchItems();
    // Para cada DaySchedule, pegar o último item de cada lista em timeSlots
    const getLast = (value: any) =>
      Array.isArray(value) ? value[value.length - 1] : value;

    const items = response.items.map((schedule) => {
      const { timeSlots } = schedule;
      return {
        ...schedule,
        timeSlots: {
          firstPeriod: getLast(timeSlots.firstPeriod),
          secondPeriod: getLast(timeSlots.secondPeriod),
          break: timeSlots.break, // Intervalo não é lista
          thirdPeriod: getLast(timeSlots.thirdPeriod),
          fourthPeriod: getLast(timeSlots.fourthPeriod),
        },
      };
    });
    return { ...response, items };
  };

  return { fetchScheduleAsync };
}
