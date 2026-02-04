import { db } from "@/firebase/config";
import { collection, doc, getDoc } from "firebase/firestore";

const days = ["segunda", "terça", "quarta", "quinta", "sexta"];

export async function fetchSchedulesByDay() {
  const allDays: {
    day: string;
    lessons: { materia: string; professor: string }[];
  }[] = [];
  for (const day of days) {
    const docRef = doc(collection(db, "schedules"), day);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Filtra apenas as chaves numéricas e ordena
      const lessons = Object.keys(data)
        .filter((key) => !isNaN(Number(key)))
        .sort((a, b) => Number(a) - Number(b))
        .map((key) => data[key]);
      allDays.push({ day, lessons });
    }
  }
  return allDays;
}
