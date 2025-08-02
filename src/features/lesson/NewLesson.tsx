import { SelectSearchDB } from "@/components/common/SelectSearchDB";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lesson } from "./Lesson";
import { useCallback, useState } from "react";
import { doc, Timestamp } from "firebase/firestore";
import { setDocWithLog } from "@/firebase/firestoreWithLog";
import { toast } from "sonner";
import { handleKeyDown } from "@/utils/HandleKeyDown";
import { lessonsCollection } from "@/firebase/config";

export const NewLesson: React.FC = () => {
  const [lesson, setLesson] = useState<Omit<Lesson, "id">>({
    name: "",
    color: "#ff0000",
    active: true,
  });

  const handleSelectChange = useCallback(
    (field: keyof typeof lesson, selected: any, isMulti = false) => {
      if (isMulti) {
        setLesson((prev) => ({
          ...prev,
          [field]: Array.isArray(selected)
            ? selected.map((item) => item.value)
            : [],
        }));
      } else {
        setLesson((prev) => ({
          ...prev,
          [field]: selected && !Array.isArray(selected) ? selected.value : "",
        }));
      }
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const lessonId = doc(lessonsCollection).id;
      const lessonDocRef = doc(lessonsCollection, lessonId);
      const message = `Lesson ${lesson.name} cadastrado`;
      await setDocWithLog(lessonDocRef, { ...lesson, id: lessonId }, message);
      toast.success(message);
      setLesson({
        name: "",
        color: "",
        active: true,
      });
    } catch (error) {
      toast.warning("Erro ao cadastrar lesson");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Nova Matéria</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar Nova Matéria</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          onKeyDown={handleKeyDown}
          className="flex flex-col gap-2 p-3">
          <Label>Nome</Label>
          <Input
            value={lesson.name}
            onChange={(e) => setLesson({ ...lesson, name: e.target.value })}
            required
          />
          <Label>Cor</Label>
          <div className="flex gap-3">
            <Input
              value={lesson.color}
              type="color"
              onChange={(e) =>
                setLesson((prev) => ({ ...prev, color: e.target.value }))
              }
              className="p-2 w-10 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <div
              className="px-3 py-2 rounded font-bold text-white w-min"
              style={{ backgroundColor: lesson.color }}>
              {lesson.name || "Preview"}
            </div>
          </div>

          <Button className="mt-4" type="submit">
            Cadastrar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
