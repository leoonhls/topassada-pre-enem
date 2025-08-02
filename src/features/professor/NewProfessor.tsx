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
import { lessonsCollection, professorsCollection } from "@/firebase/config";
import { Professor } from "./Professor";
import { useCallback, useState } from "react";
import { doc, Timestamp } from "firebase/firestore";
import { setDocWithLog } from "@/firebase/firestoreWithLog";
import { toast } from "sonner";
import { handleKeyDown } from "@/utils/HandleKeyDown";

export const NewProfessor: React.FC = () => {
  const [professor, setProfessor] = useState<Omit<Professor, "id">>({
    name: "",
    cpf: "",
    phone: "",
    email: "",
    subjectsIds: [],
    active: true,
  });

  const handleSelectChange = useCallback(
    (field: keyof typeof professor, selected: any, isMulti = false) => {
      if (isMulti) {
        setProfessor((prev) => ({
          ...prev,
          [field]: Array.isArray(selected)
            ? selected.map((item) => item.value)
            : [],
        }));
      } else {
        setProfessor((prev) => ({
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
      const professorId = doc(professorsCollection).id;
      const professorDocRef = doc(professorsCollection, professorId);
      const message = `Professor ${professor.name} cadastrado`;
      await setDocWithLog(
        professorDocRef,
        { ...professor, id: professorId },
        message
      );
      toast.success(message);
      setProfessor({
        name: "",
        cpf: "",
        phone: "",
        email: "",
        subjectsIds: [],
        active: true,
      });
    } catch (error) {
      toast.warning("Erro ao cadastrar professor");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Novo Professor</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Professor</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          onKeyDown={handleKeyDown}
          className="flex flex-col gap-2 p-3">
          <Label>Nome</Label>
          <Input
            value={professor.name}
            onChange={(e) =>
              setProfessor({ ...professor, name: e.target.value })
            }
            required
          />
          <Label>CPF</Label>
          <Input
            value={professor.cpf}
            onChange={(e) =>
              setProfessor({ ...professor, cpf: e.target.value })
            }
            required
          />{" "}
          <Label>Email</Label>
          <Input
            value={professor.email}
            onChange={(e) =>
              setProfessor({ ...professor, email: e.target.value })
            }
            required
          />{" "}
          <Label>Telefone</Label>
          <Input
            value={professor.phone}
            onChange={(e) =>
              setProfessor({ ...professor, phone: e.target.value })
            }
            required
          />{" "}
          <Label>Materias</Label>
          <SelectSearchDB
            collection={lessonsCollection}
            onSelect={(selected) => handleSelectChange("subjectsIds", selected)}
            isMulti
          />
          <Button className="mt-4" type="submit">
            Cadastrar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
