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
import { db } from "@/firebase/config";
import { addDocWithLog } from "@/firebase/firestoreWithLog";
import { Timestamp, collection } from "firebase/firestore";
import { ListPlusIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { User } from "./User";

type AccessLevel = User["nivel"];

interface BulkUsersByNameProps {
  onCompleted?: () => void;
}

export const BulkUsersByName: React.FC<BulkUsersByNameProps> = ({
  onCompleted,
}) => {
  const [namesRaw, setNamesRaw] = useState("");
  const [nivel, setNivel] = useState<AccessLevel>("professor");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<{ ok: string[]; fail: string[] }>({
    ok: [],
    fail: [],
  });

  const parsedNames = useMemo(() => {
    const parts = namesRaw
      .split(/[;\n]+/)
      .map((part) => part.trim())
      .filter(Boolean);
    return Array.from(new Set(parts));
  }, [namesRaw]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (parsedNames.length === 0) {
      toast.warning("Informe pelo menos um nome separado por ';'.");
      return;
    }

    setLoading(true);
    const ok: string[] = [];
    const fail: string[] = [];

    try {
      for (const name of parsedNames) {
        try {
          await addDocWithLog(
            collection(db, "users"),
            {
              name: name.toLowerCase(),
              nome_social: "",
              active: true,
              nivel,
              createdAt: Timestamp.now(),
            },
            `Usuário "${name}" cadastrado em lote por nome.`,
          );
          ok.push(name);
        } catch (error: any) {
          const message = error?.code || error?.message || "erro desconhecido";
          fail.push(`${name} (${message})`);
        }
      }
    } finally {
      setLoading(false);
    }

    setReport({ ok, fail });

    if (ok.length > 0) {
      toast.success(`${ok.length} usuário(s) cadastrado(s) com sucesso.`);
      setNamesRaw("");
      onCompleted?.();
    }

    if (fail.length > 0) {
      toast.warning(`${fail.length} nome(s) falharam no cadastro.`);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ListPlusIcon />
          Lote nomes
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastro em lote por nome</DialogTitle>
          <DialogDescription>
            Informe os nomes separados por ponto e vírgula (;). Cada registro
            será criado apenas para uso em chamadas e quadro de horários.
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
            <Label className="text-muted-foreground italic ml-1">Nomes</Label>
            <textarea
              value={namesRaw}
              onChange={(e) => setNamesRaw(e.target.value)}
              placeholder="Ana Clara; Bruno Silva; Camila Rocha"
              rows={5}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              required
            />
            <span className="text-xs text-muted-foreground">
              Total detectado: {parsedNames.length}
            </span>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar em lote"}
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
