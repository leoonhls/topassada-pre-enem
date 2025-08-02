import { Timestamp } from "firebase/firestore";

export interface Professor {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone?: string;
  subjectsIds: string[];
  active: boolean;
}
