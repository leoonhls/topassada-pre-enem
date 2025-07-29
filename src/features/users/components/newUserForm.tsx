import { db, firebaseConfig, storage } from "@/firebase/config";
import { setDocWithLog } from "@/firebase/firestoreWithLog";
import { User } from "@/features/users/User";
import { Label } from "@radix-ui/react-dropdown-menu";
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { doc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../../../components/ui/button";
import { Checkbox } from "../../../components/ui/checkbox";
import { Input } from "../../../components/ui/input";

export function NewUserForm({ onSuccess }: { onSuccess?: () => void }) {
  const [user, setUser] = useState<Omit<User, "id" | "createdAt">>({
    name: "",
    email: "",
    adm: false,
    pfpPath: "",
  });
  const [msg, setMsg] = useState("");
  const [password, setPassword] = useState("");
  const [pfpFile, setPfpFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();
    setMsg("");
    try {
      setUser({ ...user, name: user.name.toLowerCase() });
      const appSecondary = initializeApp(firebaseConfig, "Secondary");
      const secundaryAuth = getAuth(appSecondary);
      const cred = await createUserWithEmailAndPassword(
        secundaryAuth,
        user.email,
        password
      );
      let pfpPath = "";
      if (pfpFile) {
        pfpPath = `pfps/${cred.user.uid}_${pfpFile.name}`;
        await uploadBytes(ref(storage, pfpPath), pfpFile);
      }
      await setDocWithLog(
        doc(db, "users", cred.user.uid),
        { ...user, name: user.name.toLowerCase(), createdAt: Timestamp.now() },
        `Usuário "${user.name}" cadastrado com sucesso.`
      );
      toast.success("Usuário criado com sucesso!");
      setUser({
        name: "",
        email: "",
        adm: false,
        pfpPath: "",
      });
      setPassword("");
      setPfpFile(null);
    } catch (err: any) {
      toast.warning(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-5 py-3">
      <div className="space-y-2">
        <Label className="text-muted-foreground italic">Nome</Label>
        <Input
          type="text"
          placeholder="Digite o nome completo..."
          value={user.name}
          onChange={(e) => setUser({ ...user, name: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label className="text-muted-foreground italic">E-mail</Label>
        <Input
          type="email"
          placeholder="Digite o email..."
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
          required
          className="text-zinc-200"
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
      <div className="space-y-2">
        <Label className="text-muted-foreground italic">Foto de Perfil</Label>
        <Input
          type="file"
          id="user_avatar"
          accept="image/*"
          onChange={(e) => setPfpFile(e.target.files?.[0] || null)}
        />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          checked={user.adm}
          onCheckedChange={() => setUser({ ...user, adm: !user.adm })}
        />
        <Label>Habilitar permissões de Administrador.</Label>
      </div>
      {msg && <div className="text-center text-sm mt-2">{msg}</div>}
      <div className="flex"></div>
      <Button type="submit" disabled={loading}>
        {loading ? "Criando..." : "Criar Usuário"}
      </Button>
    </form>
  );
}
