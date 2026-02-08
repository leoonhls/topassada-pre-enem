import React, { useEffect, useState } from "react";
import { Dialog } from "../components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "../components/ui/table";
import { Switch } from "../components/ui/switch";
import {
  collection,
  getDocs,
  addDoc,
  Timestamp,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";
import { getPreferredName } from "@/utils/stringUtils";

interface Aluno {
  id: string;
  nome: string;
  nome_social?: string;
  active?: boolean;
}

interface ChamadaAluno {
  id: string;
  nome: string;
  presenca: boolean;
  justificativa?: string;
}

interface ChamadaDocument {
  id: string;
  dia: string;
  quemFez: string;
  timestamp: any;
  lista: ChamadaAluno[];
}

const NovaChamada: React.FC = () => {
  const [chamadaExistente, setChamadaExistente] =
    useState<ChamadaDocument | null>(null);
  const [editavel, setEditavel] = useState(true);
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [chamada, setChamada] = useState<Record<string, ChamadaAluno>>({});
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const hoje = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const dataHoje = `${hoje.getFullYear()}-${pad(hoje.getMonth() + 1)}-${pad(hoje.getDate())}`;
  const [dia, setDia] = useState<string>(dataHoje);

  useEffect(() => {
    const fetchAlunos = async () => {
      setLoading(true);
      const alunosRef = collection(db, "alunos");
      const alunosQuery = query(alunosRef, where("active", "==", true));
      const querySnapshot = await getDocs(alunosQuery);
      const alunosList: Aluno[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<Aluno, "id">;
        alunosList.push({ id: doc.id, ...data });
      });
      setAlunos(alunosList);
      setLoading(false);
    };
    fetchAlunos();
  }, []);

  useEffect(() => {
    const checkChamadaDia = async () => {
      setLoading(true);
      const chamadasRef = collection(db, "chamadas");
      const chamadasQuery = query(chamadasRef, where("dia", "==", dia));
      const querySnapshot = await getDocs(chamadasQuery);
      let encontrada: ChamadaDocument | null = null;
      querySnapshot.forEach((snap) => {
        const data = snap.data() as Omit<ChamadaDocument, "id">;
        encontrada = { id: snap.id, ...data };
      });
      setChamadaExistente(encontrada);
      setEditavel(!encontrada);
      if (encontrada) {
        // Monta alunos e chamada a partir da chamada existente
        const encontradaDoc = encontrada as ChamadaDocument;
        setAlunos(
          encontradaDoc.lista.map((item: ChamadaAluno) => ({
            id: item.id,
            nome: item.nome,
          })),
        );
        const chamadaObj: Record<string, ChamadaAluno> = {};
        encontradaDoc.lista.forEach((item: ChamadaAluno) => {
          chamadaObj[item.id] = {
            id: item.id,
            nome: item.nome,
            presenca: item.presenca,
            justificativa: item.justificativa,
          };
        });
        setChamada(chamadaObj);
      } else {
        // Sem chamada: reaproveita lista de alunos já carregada
        setChamada({});
      }
      setLoading(false);
    };
    checkChamadaDia();
  }, [dia]);

  const handlePresenca = (id: string, presenca: boolean) => {
    setChamada((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        presenca,
      },
    }));
  };

  const handleJustificativa = (id: string, justificativa: string) => {
    setChamada((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        justificativa,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const chamadaList = alunos.map((aluno) => {
      const presenca = chamada[aluno.id]?.presenca ?? false;
      const justificativa =
        presenca === false && chamada[aluno.id]?.justificativa
          ? chamada[aluno.id]?.justificativa
          : undefined;
      const item: {
        id: string;
        nome: string;
        presenca: boolean;
        justificativa?: string;
      } = {
        id: aluno.id,
        nome: aluno.nome,
        presenca,
      };
      if (
        justificativa !== undefined &&
        justificativa !== null &&
        justificativa !== ""
      ) {
        item.justificativa = justificativa;
      }
      return item;
    });
    if (chamadaExistente) {
      // Atualiza chamada existente para o dia
      await updateDoc(doc(db, "chamadas", chamadaExistente.id), {
        timestamp: Timestamp.now(),
        quemFez: currentUser?.email || "desconhecido",
        lista: chamadaList,
      });
      alert("Chamada atualizada com sucesso!");
    } else {
      // Cria nova chamada para o dia
      await addDoc(collection(db, "chamadas"), {
        timestamp: Timestamp.now(),
        dia,
        quemFez: currentUser?.email || "desconhecido",
        lista: chamadaList,
      });
      alert("Chamada registrada com sucesso!");
    }
    setChamada({});
  };

  if (loading) return <div>Carregando alunos...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Fazer Chamada</h1>
      <div className="mb-4">
        <label className="font-semibold mr-2">Dia:</label>
        <input
          type="date"
          value={dia}
          onChange={(e) => setDia(e.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>
      {chamadaExistente && (
        <div className="mb-4 flex items-center gap-4">
          <span className="text-destructive font-semibold">
            Já existe chamada para o dia selecionado.
          </span>
          <div className="flex items-center gap-2">
            <Switch
              checked={editavel}
              onCheckedChange={setEditavel}
              id="switch-editavel"
            />
            <label htmlFor="switch-editavel" className="text-sm font-medium">
              Habilitar edição
            </label>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <fieldset disabled={!editavel}>
          <div className="w-full overflow-x-auto mb-4 rounded-xl border">
            <Table className=" text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="border px-2 py-1 sticky left-0 bg-card z-10">
                    Nome
                  </TableHead>
                  <TableHead className="border px-2 py-1">Presença</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alunos.map((aluno) => (
                  <TableRow key={aluno.id}>
                    <TableCell className="border px-2 py-1 sticky left-0 bg-card z-10">
                      {getPreferredName(aluno.nome, (aluno as any).nome_social)}
                    </TableCell>
                    <TableCell className="border px-2 py-1 text-center">
                      <button
                        type="button"
                        className={`mr-2 px-2 py-1 rounded ${chamada[aluno.id]?.presenca ? "bg-success text-foreground" : "bg-muted"}`}
                        onClick={() => handlePresenca(aluno.id, true)}>
                        ✓
                      </button>
                      <button
                        type="button"
                        className={`px-2 py-1 rounded ${chamada[aluno.id]?.presenca === false ? "bg-destructive text-destructive-foreground" : "bg-muted"}`}
                        onClick={() => handlePresenca(aluno.id, false)}>
                        X
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <button
            type="submit"
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
            disabled={!editavel}>
            Salvar Chamada
          </button>
        </fieldset>
      </form>
    </div>
  );
};

export default NovaChamada;
