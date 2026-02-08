import { useState } from "react";
import { Day } from "@/types/Day";
import { Materias } from "@/types/Materias";
import { useFirebaseDocumentCache } from "@/hooks/useFirebaseDocumentCache";
import { User } from "@/features/user/User";
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

// Recebe todos os dias e permite editar o quadro inteiro
export default function EditFullSchedule({
  days,
  onSave,
}: {
  days: Day[];
  onSave?: (updated: Day[]) => void;
}) {
  const [edit, setEdit] = useState(() =>
    days.map((d) => ({ ...d, lessons: [...d.lessons] })),
  );
  const { getFromCacheOrFetch } = useFirebaseDocumentCache<User>("users");
  const [professores, setProfessores] = useState<User[]>([]);

  // Carrega todos os professores ativos uma vez
  useState(() => {
    (async () => {
      const res = await fetch("/professores.json")
        .then((r) => r.json())
        .catch(() => []);
      const profs: User[] = [];
      for (const prof of res) {
        if (prof.nivel === "professor") {
          const cached = await getFromCacheOrFetch(prof.id);
          if (cached) profs.push(cached);
        }
      }
      setProfessores(profs);
    })();
  });

  const handleChange = (
    dayIdx: number,
    lessonIdx: number,
    field: "materia" | "professor",
    value: string,
  ) => {
    setEdit((prev) =>
      prev.map((d, i) =>
        i === dayIdx
          ? {
              ...d,
              lessons: d.lessons.map((l, j) =>
                j === lessonIdx ? { ...l, [field]: value } : l,
              ),
            }
          : d,
      ),
    );
  };

  const handleSave = async () => {
    // Atualiza todos os dias no Firestore
    for (const d of edit) {
      const docRef = doc(db, "schedules", d.day);
      const data = d.lessons.reduce(
        (acc, lesson, idx) => {
          acc[idx] = lesson;
          return acc;
        },
        {} as Record<string, { materia: string; professor: string }>,
      );
      await setDoc(docRef, data, { merge: true });
    }
    onSave?.(edit);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size={"sm"} variant="outline">
          <Edit />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Editar Quadro de Horários</AlertDialogTitle>
          <AlertDialogDescription>
            Edite todas as matérias e professores da semana de uma vez.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-6 max-h-[60vh] overflow-auto">
          {edit.map((day, dayIdx) => (
            <div key={day.day}>
              <div className="font-bold mb-2 capitalize">{day.day}-feira</div>
              <div className="flex flex-col gap-2">
                {[0, 1, 2, 3].map((lessonIdx) => (
                  <div key={lessonIdx} className="flex items-center gap-4 my-1">
                    <span className="w-8 text-center font-bold">
                      {lessonIdx + 1}º
                    </span>
                    <Select
                      value={day.lessons[lessonIdx]?.materia || ""}
                      onValueChange={(value) =>
                        handleChange(dayIdx, lessonIdx, "materia", value)
                      }>
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
                      value={day.lessons[lessonIdx]?.professor || ""}
                      onValueChange={(value) =>
                        handleChange(dayIdx, lessonIdx, "professor", value)
                      }>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Professor" />
                      </SelectTrigger>
                      <SelectContent>
                        {professores.map((p) => (
                          <SelectItem key={p.id} value={p.name}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleSave}>
            Salvar Tudo
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
