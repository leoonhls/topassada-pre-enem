import { Timestamp } from "firebase/firestore";

export const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"] as const;
export type Day = (typeof days)[number];

export interface WeekDay {
  id: string;
  createdAt: Timestamp;
  createdBy: string;
  day: Day;
  lessonId: string;
  professorId: string;
}
