import { SelectSearchDB } from "@/components/common/SelectSearchDB";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { subjectsCollection, usersCollection } from "@/firebase/config";
import { useFirebaseDocumentCache } from "@/hooks/useFirebaseDocumentCache";
import { capitalizeFirstLetter } from "@/utils/stringUtils";
import { Edit } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Subject } from "../subject/Subject";
import { User } from "../user/User";
import { periods } from "./Days";
import { DaySchedule, TimeSlot } from "./DaySchedule";
import { updateTimeSlotVersion } from "./updateTimeSlotVersion";
import { populateSingleVersionSchedules } from "@/utils/populateSingleVersionSchedules";

type Props = {
  scheduleDay: DaySchedule;
  onSave?: (updatedScheduleDay: DaySchedule) => void;
};

export default function EditDaySchedule({ scheduleDay, onSave }: Props) {
  const [changes, setChanges] = useState<{
    [timeSlotKey: string]: {
      subjectId?: string;
      teacherId?: string;
    };
  }>({});

  // Ordem correta dos timeSlots
  const timeSlotOrder = [
    "firstPeriod",
    "secondPeriod",
    "thirdPeriod",
    "fourthPeriod",
  ];

  const handleTimeSlotChange = (
    timeSlotKey: string,
    field: "subjectId" | "teacherId",
    value: string
  ) => {
    setChanges((prev) => ({
      ...prev,
      [timeSlotKey]: {
        ...prev[timeSlotKey],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // Para cada alteração, cria nova versão e fecha anterior
    await Promise.all(
      Object.entries(changes).map(async ([timeSlotKey, change]) => {
        if (timeSlotKey === "break") return;
        const slot = (scheduleDay.timeSlots as any)[timeSlotKey];
        if (change.subjectId || change.teacherId) {
          await updateTimeSlotVersion(
            scheduleDay.id,
            timeSlotKey,
            change.subjectId || slot.subjectId,
            change.teacherId || slot.teacherId,
            today
          );
        }
      })
    );
    // Opcional: pode chamar onSave para atualizar UI local
    onSave?.(scheduleDay);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="text-muted-foreground" variant={"ghost"} size={"sm"}>
          <Edit height={10} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {capitalizeFirstLetter(scheduleDay.id)}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Edição de matérias e professores.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
          {timeSlotOrder.map((key) => {
            const timeSlot =
              scheduleDay.timeSlots[key as keyof typeof scheduleDay.timeSlots];
            if (
              !timeSlot ||
              ("type" in timeSlot && timeSlot.type === "interval")
            ) {
              return null;
            }
            return (
              <EditTimeSlot
                key={key}
                timeSlotKey={key}
                timeSlot={timeSlot as TimeSlot}
                horario={periods[key as keyof typeof periods]}
                onChange={handleTimeSlotChange}
              />
            );
          })}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSave}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

type TimeSlotRowProps = {
  timeSlot: TimeSlot;
  horario: string;
  timeSlotKey: string;
  onChange: (
    timeSlotKey: string,
    field: "subjectId" | "teacherId",
    value: string
  ) => void;
};

export function EditTimeSlot({
  timeSlot,
  horario,
  timeSlotKey,
  onChange,
}: TimeSlotRowProps) {
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
        name: teacherData?.name || "Sem professor",
        subject: subjectData?.name || "Sem matéria",
        color: subjectData?.color || "",
      });
    } catch {}
  }, [timeSlot, getTeacher, getSubject]);

  useEffect(() => {
    fetchData();
  }, [fetchData, getTeacher, getSubject]);

  return (
    <div className="flex border rounded-sm text-sm">
      <div
        className="flex flex-col items-center justify-center bg-gray-600 p-2 px-4 rounded-l-sm text-white"
        style={{ backgroundColor: data.color }}>
        <div className="font-semibold">{horario.split("-")[0]}</div>
        <div className="font-semibold">{horario.split("-")[1]}</div>
      </div>
      <div className="p-2 pl-5 grid items-end gap-2 w-full">
        <div>
          Matéria:
          <SelectSearchDB
            placeholder={data.subject}
            collection={subjectsCollection}
            onSelect={(option) => {
              if (option && "value" in option) {
                onChange(timeSlotKey, "subjectId", option.value);
              }
            }}
          />
        </div>

        <div>
          Professor(a):
          <SelectSearchDB
            placeholder={data.name}
            collection={usersCollection}
            onSelect={(option) => {
              if (option && "value" in option) {
                onChange(timeSlotKey, "teacherId", option.value);
              }
            }}
          />
        </div>
        <Button
          onClick={() => {
            onChange(timeSlotKey, "teacherId", "null");
            onChange(timeSlotKey, "subjectId", "null");
            setData({
              name: "Sem Professor",
              subject: "Sem Matéria",
              color: "gray",
            });
          }}>
          Sem aula
        </Button>
      </div>
    </div>
  );
}
