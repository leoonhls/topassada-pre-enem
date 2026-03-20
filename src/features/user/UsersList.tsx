import { getApp, getApps, initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
} from "firebase/auth";
import { memo, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useUsers } from "./useUsers";
import { User } from "./User";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/common/LoadingState";
import { Label } from "@/components/ui/label";
import { db, firebaseConfig } from "@/firebase/config";
import { updateDocWithLog } from "@/firebase/firestoreWithLog";
import { Timestamp, doc, updateDoc } from "firebase/firestore";
import { getPreferredName } from "@/utils/stringUtils";
import { useAuth } from "@/contexts/AuthContext";

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

interface UsersListProps {
  refreshSignal?: number;
}

export const UsersList = memo(({ refreshSignal = 0 }: UsersListProps) => {
  // Hooks para gerenciar filtros e paginação

  // Estados para dados e carregamento
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [collSize, setCollSize] = useState("");
  const [editUser, setEditUser] = useState<User | null>(null);

  const [originalEmail, setOriginalEmail] = useState<string | undefined>(undefined);

  const { fetchUserAsync } = useUsers();
  const { userData } = useAuth();
  const isAdmin = !!userData?.adm;

  // Handler para remoção de item
  const handleRemove = useCallback((id: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== id));
  }, []);

  const handleEditChange = (field: keyof Omit<User, "id">, value: any) => {
    setEditUser((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    if (!isAdmin) {
      toast.warning("Apenas administradores podem alterar usuários.");
      return;
    }

    try {
      const { id, email: currentEmailInForm, ...restData } = editUser;

      // Usuário já tinha e-mail → e-mail é imutável
      if (originalEmail) {
        await updateDoc(doc(db, "users", id), restData);
        setUsers((prev) => prev.map((u) => (u.id === id ? editUser : u)));
        toast.success("Usuário atualizado com sucesso.");
        setEditUser(null);
        return;
      }

      // Usuário não tinha e-mail e admin digitou um → criar conta Auth + vincular + enviar convite
      const newEmail = (currentEmailInForm || "").trim().toLowerCase();
      if (newEmail) {
        if (!emailRegex.test(newEmail)) {
          toast.warning("E-mail inválido.");
          return;
        }
        const secondaryAuth = getSecondaryAuth();
        const cred = await createUserWithEmailAndPassword(
          secondaryAuth,
          newEmail,
          generateTempPassword(),
        );
        await updateDocWithLog(
          doc(db, "users", id),
          { ...restData, email: newEmail, authUid: cred.user.uid, updatedAt: Timestamp.now() },
          `E-mail "${newEmail}" vinculado ao usuário "${editUser.name}" e convite enviado.`,
        );
        await sendPasswordResetEmail(secondaryAuth, newEmail);
        const updatedUser = { ...editUser, email: newEmail, authUid: cred.user.uid };
        setUsers((prev) => prev.map((u) => (u.id === id ? updatedUser : u)));
        toast.success("E-mail adicionado e convite enviado!");
        setEditUser(null);
        return;
      }

      // Sem e-mail antes, sem e-mail agora → salvar normalmente
      await updateDoc(doc(db, "users", id), restData);
      setUsers((prev) => prev.map((u) => (u.id === id ? editUser : u)));
      toast.success("Usuário atualizado com sucesso.");
      setEditUser(null);
    } catch (error: any) {
      console.error(error);
      const msg =
        error?.code === "auth/email-already-in-use"
          ? "Este e-mail já está em uso em outra conta."
          : error?.message || "Erro ao atualizar usuário.";
      toast.warning(msg);
    }
  };

  // Função para carregar os dados
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchUserAsync();

      setCollSize(response.collSize.toString());
      setUsers(
        [...response.items].sort((a, b) =>
          (a.name || "").localeCompare(b.name || "", "pt-BR", { sensitivity: "base" }),
        ),
      );
    } catch (error) {
      console.error(error);
      toast.warning("Erro ao carregar useres");
    } finally {
      setLoading(false);
    }
  }, []);

  // Carrega dados iniciais ou quando filtros mudam
  useEffect(() => {
    fetchData();
  }, [fetchData, refreshSignal]);

  return (
    <div>
      <div className="w-full overflow-x-auto mb-2">
        <Table className="min-w-[640px] text-xs sm:text-sm">
          <TableHeader className="italic">
            <TableRow>
              <TableHead className="sticky left-0 z-10 bg-card">Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Nível</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium sticky left-0 z-10 bg-card">
                  {getPreferredName(user.name, (user as any).nome_social)}
                </TableCell>
                <TableCell>{user.email || "-"}</TableCell>
                <TableCell className="capitalize">{user.nivel}</TableCell>
                <TableCell>{user.active ? "Sim" : "Não"}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setEditUser(user); setOriginalEmail(user.email); }}
                    disabled={!isAdmin}>
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Indicador de Carregamento */}
      {loading && <LoadingState label="Carregando usuários..." />}

      <Dialog
        open={!!editUser}
        onOpenChange={(open) => {
           if (!open) { setEditUser(null); setOriginalEmail(undefined); }
        }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize os dados ou desative o usuário.
            </DialogDescription>
          </DialogHeader>
          {editUser && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveEdit();
              }}
              className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-muted-foreground italic ml-1">
                  Nome
                </Label>
                <Input
                  value={editUser.name}
                  onChange={(e) => handleEditChange("name", e.target.value)}
                  placeholder="Nome"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-muted-foreground italic ml-1">
                  Nome social (opcional)
                </Label>
                <Input
                  value={(editUser as any).nome_social || ""}
                  onChange={(e) =>
                    handleEditChange("nome_social" as any, e.target.value)
                  }
                  placeholder="Nome social"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-muted-foreground italic ml-1">CPF</Label>
                <Input
                  value={editUser.cpf || ""}
                  onChange={(e) => handleEditChange("cpf", e.target.value)}
                  placeholder="CPF"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-muted-foreground italic ml-1">
                  E-mail
                </Label>
                {originalEmail ? (
                  <Input value={editUser.email || ""} disabled />
                ) : (
                  <Input
                    type="email"
                    value={editUser.email || ""}
                    onChange={(e) => handleEditChange("email", e.target.value)}
                    placeholder="Adicionar e-mail para acesso ao sistema"
                  />
                )}
              </div>
                {originalEmail ? null : (
                  <p className="text-xs text-muted-foreground -mt-2 ml-1">
                    Ao salvar com e-mail, um convite será enviado automaticamente.
                  </p>
                )}
              <div className="flex flex-col gap-1.5">
                <Label className="text-muted-foreground italic ml-1">
                  Telefone
                </Label>
                <Input
                  value={editUser.phone || ""}
                  onChange={(e) => handleEditChange("phone", e.target.value)}
                  placeholder="Telefone"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium">Nível de acesso</Label>
                <select
                  value={editUser.nivel}
                  onChange={(e) =>
                    handleEditChange("nivel", e.target.value as User["nivel"])
                  }
                  className="border rounded px-2 py-1 bg-muted">
                  <option value="professor">Professor</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="adm">Administrador</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Ativo</Label>
                <Switch
                  checked={editUser.active}
                  onCheckedChange={(value) => handleEditChange("active", value)}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
});
