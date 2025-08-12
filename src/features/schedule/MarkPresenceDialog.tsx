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
import { capitalizeFirstLetter, capitalizeWords } from "@/utils/stringUtils";
import { CheckCircle } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { DaySchedule, TimeSlot } from "./DaySchedule";
import { SelectSearchConstants } from "@/components/common/SelectSearchConstants";
import { useFirebaseDocumentCache } from "@/hooks/useFirebaseDocumentCache";
import { User } from "../user/User";
import { Subject } from "../subject/Subject";
import { addDocWithLog, setDocWithLog } from "@/firebase/firestoreWithLog";
import { auth, presencesCollection } from "@/firebase/config";
import { doc, Timestamp } from "firebase/firestore";
import { toast } from "sonner";

type Props = {
  timeSlot: TimeSlot;
  onSave?: (updatedScheduleDay: DaySchedule) => void;
  selectedDate?: Date;
};

export default function MarkPresenceDialog({
  timeSlot,
  onSave,
  selectedDate,
}: Props) {
  const [data, setData] = useState({
    name: "",
    subject: "",
    color: "",
  });

  const [formData, setFormData] = useState({
    presence: "",
    justification: "",
  });

  const [isOpen, setIsOpen] = useState(false);

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
        name: teacherData?.name || "N/A",
        subject: subjectData?.name || "N/A",
        color: subjectData?.color || "N/A",
      });
    } catch {}
  }, [timeSlot, getTeacher, getSubject]);

  useEffect(() => {
    fetchData();
  }, [fetchData, getTeacher, getSubject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const presenceId = doc(presencesCollection).id;
      const subjectDocRef = doc(presencesCollection, presenceId);
      await setDocWithLog(
        subjectDocRef,
        {
          ...timeSlot,
          id: presenceId,
          createdAt: Timestamp.now(),
          createdBy: auth.currentUser!.uid,
          presenceDate: selectedDate,
          ...formData,
        },
        "Log aqui"
      );
      toast.success("Presença salva com sucesso!");

      setFormData({ presence: "", justification: "" });
      setIsOpen(false);
    } catch (error) {}
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant={"ghost"} size={"sm"} onClick={() => setIsOpen(true)}>
          <CheckCircle />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {capitalizeFirstLetter(data.subject)} -{" "}
            {capitalizeWords(
              data.name.split(" ")[0] + " " + data.name.split(" ").at(-1)
            )}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Marcar presença e justificativa.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form
          id="presenceMark"
          className="space-y-4 max-h-[50vh] overflow-y-auto p-2"
          onSubmit={(e) => {
            handleSubmit(e);
          }}>
          <SelectSearchConstants
            options={[
              { label: "Presente", value: "Presente" },
              { label: "Falta", value: "Falta" },
            ]}
            onSelect={(option) => {
              if (option && "value" in option) {
                setFormData((prev) => ({
                  ...prev,
                  presence: String(option.value),
                }));
              }
            }}
            required
          />
          <textarea
            id="presenceTextarea"
            maxLength={220}
            placeholder="Digite a justificativa ou observações..."
            value={formData.justification}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                justification: e.target.value,
              }))
            }
            className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none focus:ring-blue-500 focus:border-transparent"
            style={{
              minHeight: "128px",
              lineHeight: "1.5",
              wordWrap: "break-word",
            }}
            required={formData.presence == "Falta" ? true : false}
          />
        </form>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <Button form="presenceMark" type="submit">
            Confirmar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
