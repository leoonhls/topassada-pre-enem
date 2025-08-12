import { Day } from "./Days";

export interface DaySchedule {
  id: Day;
  timeSlots: {
    firstPeriod: TimeSlot; // 19:00 - 19:40
    secondPeriod: TimeSlot; // 19:40 - 20:20
    break: { type: "interval" }; // Intervalo 20:20 - 20:40
    thirdPeriod: TimeSlot; // 20:40 - 21:20
    fourthPeriod: TimeSlot; // 21:20 - 22:00
  };
}

export interface TimeSlot {
  subjectId: string; // ID da matéria
  teacherId: string; // ID do professor
}
