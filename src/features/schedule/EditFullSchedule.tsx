import { useEffect, useMemo, useState } from "react";
import { Day } from "@/types/Day";
import { Materias } from "@/types/Materias";
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
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
  const initialEdit = useMemo(
    () => days.map((d) => ({ ...d, lessons: [...(d.lessons || [])] })),
    [days],
  );
  const [edit, setEdit] = useState(() => initialEdit);
  const [professores, setProfessores] = useState<string[]>([]);
  const [openSelectId, setOpenSelectId] = useState<string | null>(null);

  // Mantém o estado sincronizado se a lista de dias vier atualizada do pai
  useEffect(() => {
    setEdit(initialEdit);
  }, [initialEdit]);

  // Carrega professores do Firestore (evita depender de arquivo estático e evita N getDoc)
  useEffect(() => {
    let cancelled = false;
    const fetchProfessores = async () => {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("nivel", "==", "professor"));
      const snap = await getDocs(q);

      const names = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as any) }))
        .filter((u) => u.active)
        .map((u) => u.nome_social || u.name)
        .filter(Boolean)
        .sort((a: string, b: string) => a.localeCompare(b));

      if (!cancelled) setProfessores(names);
    };
    fetchProfessores().catch((e) => {
      console.error("Erro ao buscar professores:", e);
      if (!cancelled) setProfessores([]);
    });
    return () => {
      cancelled = true;
    };
  }, []);

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
    // Atualiza todos os dias no Firestore em batch (menos latência)
    const batch = writeBatch(db);
    for (const d of edit) {
      const docRef = doc(db, "schedules", d.day);
      const data = d.lessons.reduce(
        (acc, lesson, idx) => {
          acc[idx] = lesson;
          return acc;
        },
        {} as Record<string, { materia: string; professor: string }>,
      );
      batch.set(docRef, data, { merge: true });
    }
    await batch.commit();
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
                    {(() => {
                      const materiaId = `day-${dayIdx}-lesson-${lessonIdx}-materia`;
                      return (
                        <Select
                          open={openSelectId === materiaId}
                          onOpenChange={(open) =>
                            setOpenSelectId(open ? materiaId : null)
                          }
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
                      );
                    })()}
                    {(() => {
                      const professorId = `day-${dayIdx}-lesson-${lessonIdx}-professor`;
                      return (
                        <Select
                          open={openSelectId === professorId}
                          onOpenChange={(open) =>
                            setOpenSelectId(open ? professorId : null)
                          }
                          value={day.lessons[lessonIdx]?.professor || ""}
                          onValueChange={(value) =>
                            handleChange(dayIdx, lessonIdx, "professor", value)
                          }>
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
                      );
                    })()}
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
