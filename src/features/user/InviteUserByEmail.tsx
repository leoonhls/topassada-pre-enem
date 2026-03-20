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
import { db, firebaseConfig } from "@/firebase/config";
import { setDocWithLog } from "@/firebase/firestoreWithLog";
import { handleKeyDown } from "@/utils/HandleKeyDown";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
} from "firebase/auth";
import { Timestamp, doc } from "firebase/firestore";
import { MailIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { User } from "./User";

interface InviteUserByEmailProps {
  onCompleted?: () => void;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getSecondaryAuth() {
  const appName = "Secondary";
  const hasApp = getApps().some((app) => app.name === appName);
  const app = hasApp ? getApp(appName) : initializeApp(firebaseConfig, appName);
  return getAuth(app);
}

function generateTempPassword() {
  return `Tmp#${Math.random().toString(36).slice(2)}${Date.now()}`;
}

export const InviteUserByEmail: React.FC<InviteUserByEmailProps> = ({
  onCompleted,
}) => {
  const [user, setUser] = useState<Pick<User, "name" | "email" | "nivel">>({
    name: "",
    email: "",
    nivel: "professor",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const email = (user.email || "").trim().toLowerCase();

    if (!emailRegex.test(email)) {
      toast.warning("Informe um e-mail válido.");
      return;
    }

    try {
      const secondaryAuth = getSecondaryAuth();
      const name = user.name.trim().toLowerCase();
      const cred = await createUserWithEmailAndPassword(
        secondaryAuth,
        email,
        generateTempPassword(),
      );

      await setDocWithLog(
        doc(db, "users", cred.user.uid),
        {
          name,
          nome_social: "",
          email,
          active: true,
          nivel: user.nivel,
          createdAt: Timestamp.now(),
        },
        `Usuário "${user.name}" convidado por e-mail com sucesso.`,
      );

      await sendPasswordResetEmail(secondaryAuth, email);

      toast.success("Convite enviado com sucesso!");
      setUser({
        name: "",
        email: "",
        nivel: "professor",
      });
      onCompleted?.();
    } catch (err: any) {
      toast.warning(err?.message || "Erro ao enviar convite.");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MailIcon />
          Convidar e-mail
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convidar por e-mail</DialogTitle>
          <DialogDescription>
            Cria a conta com nome, e-mail e nível, e envia um link para
            definição de senha.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          onKeyDown={handleKeyDown}
          className="flex flex-col gap-3 p-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground italic ml-1">Nome</Label>
            <Input
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              placeholder="Nome completo"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground italic ml-1">E-mail</Label>
            <Input
              value={user.email || ""}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              placeholder="email@dominio.com"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground italic ml-1">
              Nível de Acesso
            </Label>
            <select
              value={user.nivel}
              onChange={(e) =>
                setUser({ ...user, nivel: e.target.value as User["nivel"] })
              }
              className="border rounded px-2 py-2 bg-background text-sm"
              required>
              <option value="professor">Professor</option>
              <option value="supervisor">Supervisor</option>
              <option value="adm">Administrador</option>
            </select>
          </div>

          <Button className="mt-4" type="submit">
            Enviar convite
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
