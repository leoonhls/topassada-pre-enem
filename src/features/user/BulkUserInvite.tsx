import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { db, firebaseConfig } from "@/firebase/config";
import { setDocWithLog } from "@/firebase/firestoreWithLog";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
} from "firebase/auth";
import { Timestamp, doc } from "firebase/firestore";
import { MailPlusIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { User } from "./User";

type AccessLevel = User["nivel"];

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

function getDefaultNameFromEmail(email: string) {
  const local = email.split("@")[0] || "usuario";
  return (
    local
      .replace(/[._-]+/g, " ")
      .trim()
      .toLowerCase() || "usuario"
  );
}

interface BulkUserInviteProps {
  onCompleted?: () => void;
}

export const BulkUserInvite: React.FC<BulkUserInviteProps> = ({
  onCompleted,
}) => {
  const [emailsRaw, setEmailsRaw] = useState("");
  const [nivel, setNivel] = useState<AccessLevel>("professor");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<{ ok: string[]; fail: string[] }>({
    ok: [],
    fail: [],
  });

  const parsedEmails = useMemo(() => {
    const parts = emailsRaw
      .split(/[;\n]+/)
      .map((part) => part.trim().toLowerCase())
      .filter(Boolean);
    return Array.from(new Set(parts));
  }, [emailsRaw]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (parsedEmails.length === 0) {
      toast.warning("Informe pelo menos um e-mail separado por ';'.");
      return;
    }

    const invalidEmails = parsedEmails.filter(
      (email) => !emailRegex.test(email),
    );
    if (invalidEmails.length > 0) {
      toast.warning(`E-mails inválidos: ${invalidEmails.join(", ")}`);
      return;
    }

    setLoading(true);
    const ok: string[] = [];
    const fail: string[] = [];

    try {
      const secondaryAuth = getSecondaryAuth();

      for (const email of parsedEmails) {
        try {
          const tempPassword = generateTempPassword();
          const cred = await createUserWithEmailAndPassword(
            secondaryAuth,
            email,
            tempPassword,
          );

          await setDocWithLog(
            doc(db, "users", cred.user.uid),
            {
              name: getDefaultNameFromEmail(email),
              nome_social: "",
              email,
              active: true,
              nivel,
              createdAt: Timestamp.now(),
            },
            `Usuário convidado por e-mail: "${email}".`,
          );

          await sendPasswordResetEmail(secondaryAuth, email);
          ok.push(email);
        } catch (error: any) {
          const message = error?.code || error?.message || "erro desconhecido";
          fail.push(`${email} (${message})`);
        }
      }
    } finally {
      setLoading(false);
    }

    setReport({ ok, fail });

    if (ok.length > 0) {
      toast.success(`${ok.length} convite(s) enviado(s) com sucesso.`);
      setEmailsRaw("");
      onCompleted?.();
    }

    if (fail.length > 0) {
      toast.warning(`${fail.length} e-mail(s) falharam no convite.`);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MailPlusIcon />
          Lote e-mails
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convite em lote por e-mail</DialogTitle>
          <DialogDescription>
            Informe os e-mails separados por ponto e vírgula (;). Cada conta
            será criada e receberá um e-mail para definição de senha.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground italic ml-1">
              Nível de Acesso
            </Label>
            <select
              value={nivel}
              onChange={(e) => setNivel(e.target.value as AccessLevel)}
              className="border rounded px-2 py-2 bg-background">
              <option value="professor">Professor</option>
              <option value="supervisor">Supervisor</option>
              <option value="adm">Administrador</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground italic ml-1">E-mails</Label>
            <textarea
              value={emailsRaw}
              onChange={(e) => setEmailsRaw(e.target.value)}
              placeholder="email1@dominio.com; email2@dominio.com"
              rows={5}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              required
            />
            <span className="text-xs text-muted-foreground">
              Total detectado: {parsedEmails.length}
            </span>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Convidar em lote"}
          </Button>

          {(report.ok.length > 0 || report.fail.length > 0) && (
            <div className="text-xs border rounded p-2 space-y-1">
              <div>Sucesso: {report.ok.length}</div>
              <div>Falha: {report.fail.length}</div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};
