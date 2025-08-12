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
import { Subject } from "./Subject";
import { useCallback, useState } from "react";
import { doc, Timestamp } from "firebase/firestore";
import { setDocWithLog } from "@/firebase/firestoreWithLog";
import { toast } from "sonner";
import { handleKeyDown } from "@/utils/HandleKeyDown";
import { subjectsCollection } from "@/firebase/config";

export const NewSubject: React.FC = () => {
  const [subject, setSubject] = useState<Omit<Subject, "id">>({
    name: "",
    color: "#ff0000",
    active: true,
  });

  const handleSelectChange = useCallback(
    (field: keyof typeof subject, selected: any, isMulti = false) => {
      if (isMulti) {
        setSubject((prev) => ({
          ...prev,
          [field]: Array.isArray(selected)
            ? selected.map((item) => item.value)
            : [],
        }));
      } else {
        setSubject((prev) => ({
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
      const subjectId = doc(subjectsCollection).id;
      const subjectDocRef = doc(subjectsCollection, subjectId);
      const message = `Subject ${subject.name} cadastrado`;
      await setDocWithLog(
        subjectDocRef,
        { ...subject, id: subjectId },
        message
      );
      toast.success(message);
      setSubject({
        name: "",
        color: "",
        active: true,
      });
    } catch (error) {
      toast.warning("Erro ao cadastrar subject");
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
            value={subject.name}
            onChange={(e) => setSubject({ ...subject, name: e.target.value })}
            required
          />
          <Label>Cor</Label>
          <div className="flex gap-3">
            <Input
              value={subject.color}
              type="color"
              onChange={(e) =>
                setSubject((prev) => ({ ...prev, color: e.target.value }))
              }
              className="p-2 w-10 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <div
              className="px-3 py-2 rounded font-bold text-white w-min"
              style={{ backgroundColor: subject.color }}>
              {subject.name || "Preview"}
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
