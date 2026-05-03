import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/common/LoadingState";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getPreferredName } from "@/utils/stringUtils";

export const AlunosList: React.FC = () => {
  const [alunos, setAlunos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState<"ativos" | "inativos" | "todos">("ativos");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const snap = await getDocs(collection(db, "alunos"));
      const list: any[] = [];
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      list.sort((a, b) =>
        (a.nome || "").localeCompare(b.nome || "", "pt-BR", { sensitivity: "base" }),
      );
      setAlunos(list);
      setLoading(false);
    };
    fetch();
  }, []);

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

  if (loading) return <LoadingState label="Carregando alunos..." fullscreen />;

  const filteredAlunos =
    filterStatus === "ativos"
      ? alunos.filter((a) => a.active === true)
      : filterStatus === "inativos"
        ? alunos.filter((a) => a.active === false)
        : alunos;

  const countAtivos = alunos.filter((a) => a.active === true).length;
  const countInativos = alunos.filter((a) => a.active === false).length;

  return (
    <>
      <div className="flex gap-2 mb-3">
        <Button
          size="sm"
          variant={filterStatus === "ativos" ? "default" : "outline"}
          onClick={() => setFilterStatus("ativos")}>
          Ativos ({countAtivos})
        </Button>
        <Button
          size="sm"
          variant={filterStatus === "inativos" ? "default" : "outline"}
          onClick={() => setFilterStatus("inativos")}>
          Inativos ({countInativos})
        </Button>
        <Button
          size="sm"
          variant={filterStatus === "todos" ? "default" : "outline"}
          onClick={() => setFilterStatus("todos")}>
          Todos ({alunos.length})
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredAlunos.map((aluno) => {
          const nome = getPreferredName(aluno.nome, aluno.nome_social);
          return (
            <div
              key={aluno.id}
              className="rounded-xl border bg-card p-3 flex flex-col gap-2.5 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-sm leading-tight truncate">{nome}</p>
                  {aluno.nome_social && aluno.nome !== aluno.nome_social && (
                    <p className="text-xs text-muted-foreground truncate">{aluno.nome}</p>
                  )}
                </div>
                <span className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-lg ${
                  aluno.active
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {aluno.active ? "Ativo" : "Inativo"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
                {aluno.cpf && (
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wide font-medium">CPF</span>
                    <span className="truncate">{aluno.cpf}</span>
                  </div>
                )}
                {aluno.phone && (
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wide font-medium">Telefone</span>
                    <span className="truncate">{aluno.phone}</span>
                  </div>
                )}
                {aluno.email && (
                  <div className="flex flex-col col-span-2">
                    <span className="text-[10px] uppercase tracking-wide font-medium">Email</span>
                    <span className="truncate">{aluno.email}</span>
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-0.5 active:scale-[0.96] transition-transform"
                onClick={() => setEditForm(aluno)}>
                Editar
              </Button>
            </div>
          );
        })}
      </div>
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
              <div className="flex flex-col gap-1.5">
                <Label className="text-muted-foreground italic ml-1">
                  Nome
                </Label>
                <Input
                  name="nome"
                  value={editForm.nome || ""}
                  onChange={handleEditChange}
                  placeholder="Nome"
                  className="border rounded px-2 py-1"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-muted-foreground italic ml-1">
                  Nome social
                </Label>
                <Input
                  name="nome_social"
                  value={editForm.nome_social || ""}
                  onChange={handleEditChange}
                  placeholder="Nome social"
                  className="border rounded px-2 py-1"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-muted-foreground italic ml-1">
                  Nome Teams (opcional)
                </Label>
                <Input
                  name="nome_teams"
                  value={editForm.nome_teams || ""}
                  onChange={handleEditChange}
                  placeholder="Nome no Microsoft Teams"
                  className="border rounded px-2 py-1"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-muted-foreground italic ml-1">CPF</Label>
                <Input
                  name="cpf"
                  value={editForm.cpf || ""}
                  onChange={handleEditChange}
                  placeholder="CPF"
                  className="border rounded px-2 py-1"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-muted-foreground italic ml-1">
                  Email
                </Label>
                <Input
                  name="email"
                  value={editForm.email || ""}
                  onChange={handleEditChange}
                  placeholder="Email"
                  className="border rounded px-2 py-1"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-muted-foreground italic ml-1">
                  Telefone
                </Label>
                <Input
                  name="phone"
                  value={editForm.phone || ""}
                  onChange={handleEditChange}
                  placeholder="Telefone"
                  className="border rounded px-2 py-1"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-muted-foreground italic ml-1">
                  URL da foto (opcional)
                </Label>
                <Input
                  name="pfpPath"
                  value={editForm.pfpPath || ""}
                  onChange={handleEditChange}
                  placeholder="URL da foto (opcional)"
                  className="border rounded px-2 py-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Ativo</Label>
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
