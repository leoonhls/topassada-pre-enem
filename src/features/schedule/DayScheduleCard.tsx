import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DaySchedule, TimeSlot } from "./DaySchedule";
import { capitalizeFirstLetter } from "@/utils/stringUtils";
import { useFirebaseDocumentCache } from "@/hooks/useFirebaseDocumentCache";
import { User } from "../user/User";
import { Subject } from "../subject/Subject";
import { useCallback, useEffect, useState } from "react";

type Props = {
  daySchedule: DaySchedule;
};

export default function DayScheduleCard({ daySchedule }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{capitalizeFirstLetter(daySchedule.id)}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <TimeSlotRow
          horario={"19:00-19:40"}
          timeSlot={daySchedule.timeSlots.firstPeriod}
        />
        <TimeSlotRow
          horario={"19:40-20:20"}
          timeSlot={daySchedule.timeSlots.secondPeriod}
        />
        <TimeSlotRow
          horario={"20:40-21:20"}
          timeSlot={daySchedule.timeSlots.thirdPeriod}
        />
        <TimeSlotRow
          horario={"21:20-22:00"}
          timeSlot={daySchedule.timeSlots.fourthPeriod}
        />
      </CardContent>
    </Card>
  );
}

type TimeSlotRowProps = {
  timeSlot: TimeSlot;
  horario: string;
};

export function TimeSlotRow({ timeSlot, horario }: TimeSlotRowProps) {
  if (!timeSlot) return;

  const [data, setData] = useState({
    name: "",
    subject: "",
  });

  const { getFromCacheOrFetch: getTeacher } =
    useFirebaseDocumentCache<User>("users");
  const { getFromCacheOrFetch: getSubject } =
    useFirebaseDocumentCache<Subject>("lessons");

  const fetchData = useCallback(async () => {
    try {
      const [subjectData, teacherData] = await Promise.all([
        getSubject(timeSlot.subjectId),
        getTeacher(timeSlot.teacherId),
      ]);

      setData({
        name: teacherData?.name || "N/A",
        subject: subjectData?.name || "N/A",
      });
    } catch {}
  }, [timeSlot, getTeacher, getSubject]);

  useEffect(() => {
    fetchData();
  }, [fetchData, getTeacher, getSubject]);

  return (
    <div className="flex border rounded-sm">
      <div className="bg-violet-600 p-2 px-4 rounded-l-sm text-white">
        <div className="font-semibold">{horario.split("-")[0]}</div>
        <div className="font-semibold">{horario.split("-")[1]}</div>
      </div>
      <div className="p-2 pl-5 ">
        <div className="font-semibold">
          {capitalizeFirstLetter(data.subject)}
        </div>

        <div className="text-muted-foreground">
          {capitalizeFirstLetter(data.name)}
        </div>
      </div>
    </div>
  );
}
