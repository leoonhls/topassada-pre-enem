import { Timestamp } from "firebase/firestore";

export interface User {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone?: string;
  active: boolean;
  pfpPath?: string;
  nivel: "professor" | "supervisor" | "adm";
}
