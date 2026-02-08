import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

export const AlunosList: React.FC = () => {
  const [alunos, setAlunos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState<any | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const snap = await getDocs(collection(db, "alunos"));
      const list: any[] = [];
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setAlunos(list);
      setLoading(false);
    };
    fetch();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "alunos", id));
    setAlunos(alunos.filter((a) => a.id !== id));
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editForm) return;
    const { name, value } = e.target;
    setEditForm((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggleActive = (value: boolean) => {
    setEditForm((prev: any) => ({
      ...prev,
      active: value,
    }));
  };

  const handleSaveEdit = async () => {
    if (!editForm) return;
    const { id, ...data } = editForm;
    await updateDoc(doc(db, "alunos", id), data);
    setAlunos((prev) => prev.map((a) => (a.id === id ? editForm : a)));
    setEditForm(null);
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <>
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Nome Social</TableHead>
            <TableHead>CPF</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Ativo</TableHead>
            <TableHead>Foto</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {alunos.map((aluno) => (
            <TableRow key={aluno.id}>
              <TableCell>{aluno.nome}</TableCell>
              <TableCell>{aluno.nome_social}</TableCell>
              <TableCell>{aluno.cpf}</TableCell>
              <TableCell>{aluno.email}</TableCell>
              <TableCell>{aluno.phone}</TableCell>
              <TableCell>{aluno.active ? "Sim" : "Não"}</TableCell>
              <TableCell>
                {aluno.pfpPath ? (
                  <img
                    src={aluno.pfpPath}
                    alt="Foto"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditForm(aluno)}>
                  Editar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog
        open={!!editForm}
        onOpenChange={(open) => !open && setEditForm(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Aluno</DialogTitle>
            <DialogDescription>
              Atualize os dados ou desative o aluno.
            </DialogDescription>
          </DialogHeader>
          {editForm && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveEdit();
              }}
              className="flex flex-col gap-3">
              <Input
                name="nome"
                value={editForm.nome || ""}
                onChange={handleEditChange}
                placeholder="Nome"
                className="border rounded px-2 py-1"
                required
              />
              <Input
                name="nome_social"
                value={editForm.nome_social || ""}
                onChange={handleEditChange}
                placeholder="Nome social"
                className="border rounded px-2 py-1"
              />
              <Input
                name="cpf"
                value={editForm.cpf || ""}
                onChange={handleEditChange}
                placeholder="CPF"
                className="border rounded px-2 py-1"
                required
              />
              <Input
                name="email"
                value={editForm.email || ""}
                onChange={handleEditChange}
                placeholder="Email"
                className="border rounded px-2 py-1"
                required
              />
              <Input
                name="phone"
                value={editForm.phone || ""}
                onChange={handleEditChange}
                placeholder="Telefone"
                className="border rounded px-2 py-1"
              />
              <Input
                name="pfpPath"
                value={editForm.pfpPath || ""}
                onChange={handleEditChange}
                placeholder="URL da foto (opcional)"
                className="border rounded px-2 py-1"
              />
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Ativo</span>
                <Switch
                  checked={!!editForm.active}
                  onCheckedChange={handleToggleActive}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" type="button">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
