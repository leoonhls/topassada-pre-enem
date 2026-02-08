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
import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";

interface Aluno {
  id: string;
  nome: string;
}

interface ChamadaAluno {
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
      const querySnapshot = await getDocs(collection(db, "alunos"));
      const alunosList: Aluno[] = [];
      querySnapshot.forEach((doc) => {
        alunosList.push({ id: doc.id, ...doc.data() } as Aluno);
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
      const querySnapshot = await getDocs(chamadasRef);
      let encontrada = null;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.dia === dia) {
          encontrada = { id: doc.id, ...data };
        }
      });
      setChamadaExistente(encontrada);
      setEditavel(!encontrada);
      if (encontrada) {
        // Monta alunos e chamada a partir da chamada existente
        setAlunos(
          (encontrada as ChamadaDocument).lista.map(
            (item: any, idx: number) => ({
              id: String(idx),
              nome: item.nome,
            }),
          ),
        );
        const chamadaObj: Record<string, ChamadaAluno> = {};
        (encontrada as ChamadaDocument).lista.forEach(
          (item: any, idx: number) => {
            chamadaObj[String(idx)] = {
              nome: item.nome,
              presenca: item.presenca,
              justificativa: item.justificativa,
            };
          },
        );
        setChamada(chamadaObj);
      } else {
        // Carrega lista de alunos normal
        const querySnapshot = await getDocs(collection(db, "alunos"));
        const alunosList: Aluno[] = [];
        querySnapshot.forEach((doc) => {
          alunosList.push({ id: doc.id, ...doc.data() } as Aluno);
        });
        setAlunos(alunosList);
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
    await addDoc(collection(db, "chamadas"), {
      timestamp: Timestamp.now(),
      dia,
      quemFez: currentUser?.email || "desconhecido",
      lista: chamadaList,
    });
    alert("Chamada registrada com sucesso!");
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
          <span className="text-red-600 font-semibold">
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
          <Table className="w-full mb-4 border rounded-xl overflow-hidden">
            <TableHeader>
              <TableRow>
                <TableHead className="border px-2 py-1">Nome</TableHead>
                <TableHead className="border px-2 py-1">Presença</TableHead>
                <TableHead className="border px-2 py-1">
                  Justificativa
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alunos.map((aluno) => (
                <TableRow key={aluno.id}>
                  <TableCell className="border px-2 py-1">
                    {aluno.nome}
                  </TableCell>
                  <TableCell className="border px-2 py-1 text-center">
                    <button
                      type="button"
                      className={`mr-2 px-2 py-1 rounded ${chamada[aluno.id]?.presenca ? "bg-green-500 text-white" : "bg-gray-200"}`}
                      onClick={() => handlePresenca(aluno.id, true)}>
                      ✓
                    </button>
                    <button
                      type="button"
                      className={`px-2 py-1 rounded ${chamada[aluno.id]?.presenca === false ? "bg-red-500 text-white" : "bg-gray-200"}`}
                      onClick={() => handlePresenca(aluno.id, false)}>
                      X
                    </button>
                  </TableCell>
                  <TableCell className="border px-2 py-1">
                    <button
                      type="button"
                      className="px-2 py-1 rounded bg-gray-200 text-gray-700"
                      disabled={chamada[aluno.id]?.presenca !== false}
                      onClick={() => setOpenDialogId(aluno.id)}>
                      Justificar
                    </button>
                    {openDialogId === aluno.id && (
                      <Dialog
                        open={true}
                        onOpenChange={() => setOpenDialogId(null)}>
                        <div className="p-4">
                          <h2 className="text-lg font-semibold mb-2">
                            Justificativa para {aluno.nome}
                          </h2>
                          <input
                            type="text"
                            className="w-full border rounded px-2 py-1 mb-2"
                            placeholder="Justificativa (opcional)"
                            value={chamada[aluno.id]?.justificativa || ""}
                            onChange={(e) =>
                              handleJustificativa(aluno.id, e.target.value)
                            }
                          />
                          <button
                            type="button"
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            onClick={() => setOpenDialogId(null)}>
                            Salvar
                          </button>
                        </div>
                      </Dialog>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={!editavel}>
            Salvar Chamada
          </button>
        </fieldset>
      </form>
    </div>
  );
};

export default NovaChamada;
