import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateDocWithLog } from "@/firebase/firestoreWithLog";
import { useFirebaseDocumentCache } from "@/hooks/useFirebaseDocumentCache";
import { capitalizeFirstLetter } from "@/utils/stringUtils";
import { doc } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Subject } from "../subject/Subject";
import { User } from "../user/User";
import { DaySchedule, TimeSlot } from "./DaySchedule";
import EditDaySchedule from "./EditDaySchedule";
import { schedulesCollection } from "@/firebase/config";

type Props = {
  daySchedule: DaySchedule;
  onUpdate: () => void;
};

export default function DayScheduleCard({ daySchedule, onUpdate }: Props) {
  const handleSave = useCallback(
    async (updatedScheduleDay: DaySchedule) => {
      try {
        const subjectDocRef = doc(schedulesCollection, updatedScheduleDay.id);
        const message = `Horário de ${updatedScheduleDay.id} atualizado`;
        await updateDocWithLog(subjectDocRef, updatedScheduleDay, message);
        toast.success(message);

        onUpdate();

        toast.success("Horário atualizado com sucesso!");
      } catch (error) {
        console.error("Erro ao salvar horário:", error);
        toast.error("Erro ao atualizar horário");
      }
    },
    [onUpdate]
  );

  return (
    <Card className="text-sm">
      <CardHeader className="flex justify-between items-center">
        <CardTitle>{capitalizeFirstLetter(daySchedule.id)}</CardTitle>
        <EditDaySchedule scheduleDay={daySchedule} onSave={handleSave} />
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
  if (!timeSlot) return null;

  const [data, setData] = useState({
    name: "",
    subject: "",
    color: "",
  });

  const { getFromCacheOrFetch: getTeacher } =
    useFirebaseDocumentCache<User>("users");
  const { getFromCacheOrFetch: getSubject } =
    useFirebaseDocumentCache<Subject>("subjects");

  const fetchData = useCallback(async () => {
    try {
      const [subjectData, teacherData] = await Promise.all([
        getSubject(timeSlot.subjectId),
        getTeacher(timeSlot.teacherId),
      ]);

      setData({
        name: teacherData?.name || "",
        subject: subjectData?.name || "Sem Aula",
        color: subjectData?.color || "",
      });
    } catch {}
  }, [timeSlot, getTeacher, getSubject]);

  useEffect(() => {
    fetchData();
  }, [fetchData, getTeacher, getSubject]);

  return (
    <div className="flex border rounded-sm">
      <div
        className="bg-gray-600 p-2 px-4 rounded-l-sm text-white"
        style={{ backgroundColor: data.color }}>
        <div className="font-semibold">{horario.split("-")[0]}</div>
        <div className="font-semibold">{horario.split("-")[1]}</div>
      </div>
      <div className="p-2 pl-5 flex flex-col justify-center">
        <div className="font-semibold">
          {capitalizeFirstLetter(data.subject)}
        </div>

        {data.name && (
          <div className="text-muted-foreground">
            {capitalizeFirstLetter(data.name)}
          </div>
        )}
      </div>
    </div>
  );
}
