import { Timestamp } from "firebase/firestore";

export interface Professor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subjects: string[];
  createdAt: Timestamp;
}
