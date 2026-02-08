import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
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

export const NewAluno: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    nome_social: "",
    cpf: "",
    email: "",
    phone: "",
    active: true,
    pfpPath: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAdd = async () => {
    setLoading(true);
    await addDoc(collection(db, "alunos"), form);
    setForm({
      nome: "",
      nome_social: "",
      cpf: "",
      email: "",
      phone: "",
      active: true,
      pfpPath: "",
    });
    setLoading(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Adicionar Aluno</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Aluno</DialogTitle>
          <DialogDescription>
            Preencha todos os dados do aluno.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAdd();
          }}
          className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground italic ml-1">Nome</Label>
            <Input
              name="nome"
              value={form.nome}
              onChange={handleChange}
              placeholder="Nome"
              className="border rounded px-2 py-1"
              required
              disabled={loading}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground italic ml-1">
              Nome social
            </Label>
            <Input
              name="nome_social"
              value={form.nome_social}
              onChange={handleChange}
              placeholder="Nome social"
              className="border rounded px-2 py-1"
              disabled={loading}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground italic ml-1">CPF</Label>
            <Input
              name="cpf"
              value={form.cpf}
              onChange={handleChange}
              placeholder="CPF"
              className="border rounded px-2 py-1"
              required
              disabled={loading}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground italic ml-1">Email</Label>
            <Input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="border rounded px-2 py-1"
              required
              disabled={loading}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground italic ml-1">
              Telefone
            </Label>
            <Input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Telefone"
              className="border rounded px-2 py-1"
              disabled={loading}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button" disabled={loading}>
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={loading || !form.nome || !form.cpf || !form.email}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
