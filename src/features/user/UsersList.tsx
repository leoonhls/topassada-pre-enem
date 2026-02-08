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
import { Label } from "@/components/ui/label";
import { db } from "@/firebase/config";
import { doc, updateDoc } from "firebase/firestore";

export const UsersList = memo(() => {
  // Hooks para gerenciar filtros e paginação

  // Estados para dados e carregamento
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [collSize, setCollSize] = useState("");
  const [editUser, setEditUser] = useState<User | null>(null);

  const { fetchUserAsync } = useUsers();

  // Handler para remoção de item
  const handleRemove = useCallback((id: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== id));
  }, []);

  const handleEditChange = (field: keyof Omit<User, "id">, value: any) => {
    setEditUser((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    try {
      const { id, ...data } = editUser;
      await updateDoc(doc(db, "users", id), data);
      setUsers((prev) => prev.map((u) => (u.id === id ? editUser : u)));
      toast.success("Usuário atualizado com sucesso.");
      setEditUser(null);
    } catch (error: any) {
      console.error(error);
      toast.warning("Erro ao atualizar usuário.");
    }
  };

  // Função para carregar os dados
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchUserAsync();

      setCollSize(response.collSize.toString());
      setUsers(response.items);
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
  }, []);

  return (
    <div>
      <Table>
        <TableHeader className="italic">
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>CPF</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Nível</TableHead>
            <TableHead>Ativo</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.cpf}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phone}</TableCell>
              <TableCell className="capitalize">{user.nivel}</TableCell>
              <TableCell>{user.active ? "Sim" : "Não"}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditUser(user)}>
                  Editar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Indicador de Carregamento */}
      {loading && (
        <div className="mt-4 text-center text-gray-400">Carregando...</div>
      )}

      <Dialog
        open={!!editUser}
        onOpenChange={(open) => {
          if (!open) setEditUser(null);
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
                <Label className="text-muted-foreground italic ml-1">CPF</Label>
                <Input
                  value={editUser.cpf}
                  onChange={(e) => handleEditChange("cpf", e.target.value)}
                  placeholder="CPF"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-muted-foreground italic ml-1">
                  Email
                </Label>
                <Input
                  value={editUser.email}
                  onChange={(e) => handleEditChange("email", e.target.value)}
                  placeholder="Email"
                  required
                />
              </div>
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
                  className="border rounded px-2 py-1">
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
