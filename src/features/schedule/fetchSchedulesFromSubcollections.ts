import { db } from "@/firebase/config";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from "firebase/firestore";

import { Day } from "./Days";
const daysOfWeek: Day[] = ["segunda", "terça", "quarta", "quinta", "sexta"];
const periods = ["firstPeriod", "secondPeriod", "thirdPeriod", "fourthPeriod"];

export async function fetchSchedulesFromSubcollections(selectedDate: Date) {
  const targetTimestamp = Timestamp.fromDate(selectedDate);
  const schedules = [];

  for (const dayId of daysOfWeek) {
    const timeSlots: any = {};
    for (const period of periods) {
      const versionsRef = collection(
        db,
        `schedules/${dayId}/timeSlots/${period}/versions`
      );
      const versionsQuery = query(
        versionsRef,
        where("validFrom", "<=", targetTimestamp),
        orderBy("validFrom", "desc")
      );
      const versionsSnapshot = await getDocs(versionsQuery);
      const validVersions = versionsSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((version: any) => {
          if (version.validUntil) {
            return targetTimestamp.toMillis() < version.validUntil.toMillis();
          }
          return true;
        });
      timeSlots[period] = validVersions[0] || null;
    }
    // Intervalo fixo
    timeSlots.break = { type: "interval" };
    schedules.push({ id: dayId, timeSlots });
  }
  return schedules;
}
