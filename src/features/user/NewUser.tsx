import { SelectSearchConstants } from "@/components/common/SelectSearchConstants";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/firebase/config";
import { addDocWithLog } from "@/firebase/firestoreWithLog";
import { handleKeyDown } from "@/utils/HandleKeyDown";
import { Timestamp, collection } from "firebase/firestore";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { User } from "./User";
import { PlusSquareIcon } from "lucide-react";

interface NewUserProps {
  onCompleted?: () => void;
}

export const NewUser: React.FC<NewUserProps> = ({ onCompleted }) => {
  const [user, setUser] = useState<Omit<User, "id">>({
    name: "",
    nome_social: "",
    active: true,
    nivel: "professor",
  });

  const handleSelectChange = useCallback(
    (field: keyof typeof user, selected: any, isMulti = false) => {
      if (isMulti) {
        setUser((prev) => ({
          ...prev,
          [field]: Array.isArray(selected)
            ? selected.map((item) => item.value)
            : [],
        }));
      } else {
        setUser((prev) => ({
          ...prev,
          [field]: selected && !Array.isArray(selected) ? selected.value : "",
        }));
      }
    },
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const normalizedName = user.name.trim().toLowerCase();
      await addDocWithLog(
        collection(db, "users"),
        {
          ...user,
          name: normalizedName,
          createdAt: Timestamp.now(),
        },
        `Usuário "${user.name}" cadastrado com sucesso.`,
      );
      toast.success("Usuário criado com sucesso!");
      setUser({
        name: "",
        nome_social: "",
        active: true,
        nivel: "professor",
      });
      onCompleted?.();
    } catch (err: any) {
      toast.warning(err.message);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"} size={"sm"}>
          <PlusSquareIcon />
          Novo nome
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar por nome</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          onKeyDown={handleKeyDown}
          className="flex flex-col gap-3 p-3">
          <div className=" flex flex-col gap-1.5">
            <Label className="text-muted-foreground italic ml-1">Nome</Label>
            <Input
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              placeholder="Nome completo"
              required
            />
          </div>
          <div className=" flex flex-col gap-1.5">
            <Label className="text-muted-foreground italic ml-1">
              Nome social (opcional)
            </Label>
            <Input
              value={user.nome_social || ""}
              onChange={(e) =>
                setUser({ ...user, nome_social: e.target.value })
              }
              placeholder="Nome social"
            />
          </div>
          <div className=" flex flex-col gap-1.5">
            <Label className="text-muted-foreground italic ml-1">
              Nível de Acesso
            </Label>
            <SelectSearchConstants
              options={[
                { label: "Professor", value: "professor" },
                { label: "Supervisor", value: "supervisor" },
                { label: "Administrador", value: "adm" },
              ]}
              onSelect={(selected) => handleSelectChange("nivel", selected)}
              required
            />
          </div>

          <Button className="mt-4" type="submit">
            Cadastrar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
