import { Timestamp } from "firebase/firestore";

export interface User {
  id: string;
  name: string;
  email: string;
  adm: boolean;
  pfpPath: string;
  createdAt: Timestamp;
}
