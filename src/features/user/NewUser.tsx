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
import { db, firebaseConfig, storage } from "@/firebase/config";
import { setDocWithLog } from "@/firebase/firestoreWithLog";
import { handleKeyDown } from "@/utils/HandleKeyDown";
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { doc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { User } from "./User";
import { PlusSquareIcon } from "lucide-react";

export const NewUser: React.FC = () => {
  const [user, setUser] = useState<Omit<User, "id">>({
    name: "",
    cpf: "",
    phone: "",
    email: "",
    active: true,
    nivel: "professor",
  });

  const [pfpFile, setPfpFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");

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
      setUser({ ...user, name: user.name.toLowerCase() });
      const appSecondary = initializeApp(firebaseConfig, "Secondary");
      const secundaryAuth = getAuth(appSecondary);
      const cred = await createUserWithEmailAndPassword(
        secundaryAuth,
        user.email,
        password,
      );
      let pfpPath = "";
      if (pfpFile) {
        pfpPath = `pfps/${cred.user.uid}_${pfpFile.name}`;
        await uploadBytes(ref(storage, pfpPath), pfpFile);
      }
      await setDocWithLog(
        doc(db, "users", cred.user.uid),
        { ...user, name: user.name.toLowerCase(), createdAt: Timestamp.now() },
        `Usuário "${user.name}" cadastrado com sucesso.`,
      );
      toast.success("Usuário criado com sucesso!");
      setUser({
        name: "",
        cpf: "",
        phone: "",
        email: "",
        active: true,
        nivel: "professor",
      });
      setPassword("");
      setPfpFile(null);
    } catch (err: any) {
      toast.warning(err.message);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"} size={"sm"}>
          <PlusSquareIcon />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar Novo User</DialogTitle>
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
              required
            />
          </div>
          <div className=" flex flex-col gap-1.5">
            <Label className="text-muted-foreground italic ml-1">CPF</Label>
            <Input
              value={user.cpf}
              onChange={(e) => setUser({ ...user, cpf: e.target.value })}
              required
            />
          </div>
          <div className=" flex flex-col gap-1.5">
            <Label className="text-muted-foreground italic ml-1">Email</Label>
            <Input
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              required
            />
          </div>
          <div className=" flex flex-col gap-1.5">
            <Label className="text-muted-foreground italic ml-1">
              Telefone
            </Label>
            <Input
              value={user.phone}
              onChange={(e) => setUser({ ...user, phone: e.target.value })}
              required
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
          <div className="space-y-2">
            <Label className="text-muted-foreground italic">Senha</Label>
            <Input
              type="password"
              placeholder="Digite uma senha..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="text-zinc-200"
            />
          </div>
          <div className=" flex flex-col gap-1.5">
            <Label className="text-muted-foreground italic ml-1">
              Foto de Perfil
            </Label>
            <Input
              type="file"
              id="user_avatar"
              accept="image/*"
              onChange={(e) => setPfpFile(e.target.files?.[0] || null)}
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
