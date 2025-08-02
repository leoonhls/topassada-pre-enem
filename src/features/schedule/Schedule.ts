import { Timestamp } from "firebase/firestore";

export interface Schedule {
  id: string;
  lessons: ScheduleDay[];
  cratedAt: Timestamp;
  createdBy: string;
  active: boolean;
  desactivedAt: Timestamp;
  desactivedBy: string;
}
export interface ScheduleDay {
  weekDay: string;
  lessonId: string;
  professorId: string;
  startAt: Timestamp;
  endAt: Timestamp;
}

export type DiaSemana =
  | "segunda"
  | "terca"
  | "quarta"
  | "quinta"
  | "sexta"
  | "sabado";

export const DIAS_SEMANA: Record<DiaSemana, string> = {
  segunda: "Segunda-feira",
  terca: "Terça-feira",
  quarta: "Quarta-feira",
  quinta: "Quinta-feira",
  sexta: "Sexta-feira",
  sabado: "Sábado",
} as const;
