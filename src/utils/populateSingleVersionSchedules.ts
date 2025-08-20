import { db } from "@/firebase/config";
import {
  addDoc,
  collection,
  deleteDoc,
  getDocs,
  Timestamp,
} from "firebase/firestore";

const subjects = [
  "0j76QINW0Lg0yBG2sFoC",
  "9VFm2zKbr3PTt2HtsiX2",
  "HLMM57MX0Fv3JxxqE5En",
  "KjcVF04H6PmwQpU5PIUL",
  "PDZVNsor36V9caPGVBLp",
  "aSvNYZcbR5y2lKJh4v71",
  "m59UvCldlSCB3kMswiU4",
];
const teachers = [
  "5bfC3vw3mr8wNILg9lVM",
  "g4j7QucpO5NIQqiK6hzeFOCTV0l1",
  "pmUDLBJV0aQ5gKDYLah9EQ9BuR73",
];
const daysOfWeek = ["segunda", "terça", "quarta", "quinta", "sexta"];
const periods = ["firstPeriod", "secondPeriod", "thirdPeriod", "fourthPeriod"];

function getRandom(arr: any) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function populateSingleVersionSchedules() {
  const now = new Date();
  const validFrom = Timestamp.fromDate(
    new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
  );
  const validUntil = Timestamp.fromDate(
    new Date(validFrom.seconds * 1000 + 7 * 24 * 60 * 60 * 1000)
  );

  for (const day of daysOfWeek) {
    for (const period of periods) {
      // Apaga todas as versões existentes
      const versionsRef = collection(
        db,
        `schedules/${day}/timeSlots/${period}/versions`
      );
      //   const versionsSnapshot = await getDocs(versionsRef);
      //   await Promise.all(versionsSnapshot.docs.map((doc) => deleteDoc(doc.ref)));

      // Cria uma versão apenas
      await addDoc(versionsRef, {
        subjectId: getRandom(subjects),
        teacherId: getRandom(teachers),
        validFrom,
        validUntil: null,
      });
    }
  }
  // Horários populados com uma versão por período
}
