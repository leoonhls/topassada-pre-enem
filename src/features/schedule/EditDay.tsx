import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Edit } from "lucide-react";
import { capitalizeFirstLetter } from "@/utils/stringUtils";
import { useEffect, useState } from "react";
import { Materias } from "@/types/Materias";
import { useUsers } from "@/features/user/useUsers";
import { Day } from "@/types/Day";

type Props = {
  day: Day;
  onSave?: (updated: Day) => void;
};

export default function EditDaySchedule({ day, onSave }: Props) {
  // Estado local para edição dos 4 horários
  const [lessons, setLessons] = useState(() => [...(day.lessons || [])]);
  const { fetchUserAsync } = useUsers();
  const [professores, setProfessores] = useState<string[]>([]);

  useEffect(() => {
    fetchUserAsync().then((res) => {
      setProfessores(
        res.items.filter((u) => u.nivel === "professor").map((u) => u.name),
      );
    });
  }, [fetchUserAsync]);

  const handleChange = (
    idx: number,
    field: "materia" | "professor",
    value: string,
  ) => {
    setLessons((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l)),
    );
  };

  const handleSave = async () => {
    // Atualiza no Firestore: cada dia é um doc, cada lesson é uma chave 0-3
    const docRef = doc(db, "schedules", day.day);
    const data = lessons.reduce(
      (acc, lesson, idx) => {
        acc[idx] = lesson;
        return acc;
      },
      {} as Record<string, { materia: string; professor: string }>,
    );
    await setDoc(docRef, data, { merge: true });
    onSave?.({ ...day, lessons });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="text-muted-foreground" variant={"ghost"} size={"sm"}>
          <Edit height={10} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{capitalizeFirstLetter(day.day)}</AlertDialogTitle>
          <AlertDialogDescription>
            Edição de matérias e professores.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {[0, 1, 2, 3].map((idx) => (
          <div key={idx} className="flex items-center gap-4 my-2">
            <span className="w-8 text-center font-bold">{idx + 1}º</span>
            <Select
              value={lessons[idx]?.materia || ""}
              onValueChange={(value) => handleChange(idx, "materia", value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Matéria" />
              </SelectTrigger>
              <SelectContent>
                {Materias.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={lessons[idx]?.professor || ""}
              onValueChange={(value) => handleChange(idx, "professor", value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Professor" />
              </SelectTrigger>
              <SelectContent>
                {professores.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleSave}>Salvar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
