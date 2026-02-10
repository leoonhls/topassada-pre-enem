import { db } from "@/firebase/config";
import { collection, doc, getDoc } from "firebase/firestore";

const days = ["segunda", "terça", "quarta", "quinta", "sexta"];

export async function fetchSchedulesByDay() {
  const results = await Promise.all(
    days.map(async (day) => {
      const docRef = doc(collection(db, "schedules"), day);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;

      const data = docSnap.data();
      const lessons = Object.keys(data)
        .filter((key) => !isNaN(Number(key)))
        .sort((a, b) => Number(a) - Number(b))
        .map((key) => data[key]);

      return { day, lessons };
    }),
  );

  return results.filter(Boolean) as {
    day: string;
    lessons: { materia: string; professor: string }[];
  }[];
}
