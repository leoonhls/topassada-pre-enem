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
import { storage, usersCollection } from "@/firebase/config";
import { updateDocWithLog } from "@/firebase/firestoreWithLog";
import { doc } from "firebase/firestore";
import { Edit } from "lucide-react";
import React, { useState } from "react";
import { BiSave } from "react-icons/bi";
import { User } from "../User";
import { Checkbox } from "@/components/ui/checkbox";
import { deleteObject, ref, uploadBytes } from "firebase/storage";

type EditUserModalProps = {
  user: User;
};

export function EditUserModal({ user }: EditUserModalProps) {
  const [form, setForm] = useState<User>({
    id: user.id,
    name: user.name,
    email: user.email,
    adm: user.adm,
    pfpPath: "",
    createdAt: user.createdAt,
  });
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [pfpFile, setPfpFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const docRef = doc(usersCollection, user.id);
      if (pfpFile) {
        const pfpPath = `pfps/${user.id}_${pfpFile.name}`;
        await uploadBytes(ref(storage, pfpPath), pfpFile);
        deleteObject(ref(storage, user.pfpPath)).catch((error) => {
          console.error("Erro ao deletar foto de perfil antiga:", error);
        });
        form.pfpPath = pfpPath;
      }
      await updateDocWithLog(docRef, form, `Usuário editado: ${user.name}`);
      setIsOpen(false); // Fecha o dialog após sucesso
    } catch (err) {
      alert("Erro ao atualizar usuário");
      console.log("Erro ao atualizar usuário:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="font-semibold gap-2 hover:opacity-50">
          <Edit />
          Editar Usuário
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="max-h-[400px] overflow-y-auto">
          <div className="grid gap-4 grid-cols-2 p-5">
            <div className="col-span-2 space-y-2">
              <Label className="text-muted-foreground italic">Email</Label>
              <Input
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                disabled
                required
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label className="text-muted-foreground italic">Nome</Label>
              <Input
                name="name"
                placeholder="Nome"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label className="text-muted-foreground italic">
                Foto de Perfil
              </Label>
              <Input
                type="file"
                id="user_avatar"
                accept="image/*"
                onChange={(e) => setPfpFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <Checkbox
                checked={form.adm}
                onCheckedChange={() => setForm({ ...form, adm: !form.adm })}
              />
              <Label>Habilitar permissões de Administrador.</Label>
            </div>
          </div>
        </form>
        <Button onClick={() => handleSubmit()} disabled={loading}>
          <BiSave className="w-4 h-4" />
          <span>{loading ? "Salvando..." : "Salvar"}</span>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
