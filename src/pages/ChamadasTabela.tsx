import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";
import { DevPopulateData } from "@/components/DevPopulateData";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "../components/ui/table";
import { CheckCircle2Icon, X } from "lucide-react";
import { MinusIcon } from "lucide-react";
import { MdReportProblem } from "react-icons/md";
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
} from "../components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { getPreferredName } from "@/utils/stringUtils";

interface Aluno {
  id: string;
  nome: string;
  nome_social?: string;
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
  lista: ChamadaAluno[];
}

const ChamadasTabela: React.FC = () => {
  const [openDialog, setOpenDialog] = useState<{
    alunoId: string;
    dia: string;
  } | null>(null);
  const [justificativaEdit, setJustificativaEdit] = useState("");
  const [justificativaEnabled, setJustificativaEnabled] = useState(false);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [chamadas, setChamadas] = useState<ChamadaDocument[]>([]);
  const [dias, setDias] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Busca alunos
      const alunosSnapshot = await getDocs(collection(db, "alunos"));
      const alunosList: Aluno[] = [];
      alunosSnapshot.forEach((doc) => {
        alunosList.push({ id: doc.id, ...doc.data() } as Aluno);
      });
      alunosList.sort((a, b) => a.nome.localeCompare(b.nome));
      setAlunos(alunosList);
      // Busca chamadas dos últimos 30 dias
      const chamadasSnapshot = await getDocs(collection(db, "chamadas"));
      const hoje = new Date();
      const diasSet = new Set<string>();
      const chamadasList: ChamadaDocument[] = [];
      chamadasSnapshot.forEach((doc) => {
        const data = doc.data();
        // Considera só os últimos 30 dias
        const dia = data.dia;
        const dataChamada = new Date(dia);
        const diff =
          (hoje.getTime() - dataChamada.getTime()) / (1000 * 60 * 60 * 24);
        if (diff <= 30 && diff >= 0) {
          chamadasList.push({ id: doc.id, dia, lista: data.lista });
          diasSet.add(dia);
        }
      });
      // Ordena dias
      const diasArray = Array.from(diasSet).sort();
      setChamadas(chamadasList);
      setDias(diasArray);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div>Carregando...</div>;

  // Monta tabela: linhas = alunos, colunas = dias
  return (
    <div className="overflow-x-auto bg-pink-50 rounded-xl shadow-lg p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-extrabold mb-4 md:mb-6 text-pink-600">
        Chamadas dos últimos 30 dias 🐻
      </h1>
      <Table className="rounded-xl overflow-hidden border border-pink-200 text-center min-w-[640px] text-xs sm:text-sm">
        <TableHeader>
          <TableRow className="bg-pink-100">
            <TableHead className="text-pink-700 text-lg text-center sticky left-0 z-20 bg-pink-100">
              Aluno
            </TableHead>
            {dias.map((dia) => {
              let formatted = "";
              try {
                const d = new Date(dia);
                formatted = d.toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                });
              } catch {
                formatted = dia;
              }
              return (
                <TableHead key={dia} className="text-pink-700 text-center">
                  {formatted}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {alunos.map((aluno) => (
            <TableRow
              key={aluno.id}
              className="hover:bg-pink-100 transition-all">
              <TableCell className="font-semibold text-pink-600 bg-pink-50 text-center sticky left-0 z-10">
                {getPreferredName(aluno.nome, (aluno as any).nome_social)}
              </TableCell>
              {dias.map((dia) => {
                const chamadaDia = chamadas.find((c) => c.dia === dia);
                if (!chamadaDia)
                  return (
                    <TableCell className="bg-white text-gray-400 text-center">
                      -
                    </TableCell>
                  );
                const alunoChamada = chamadaDia.lista.find(
                  (a) => a.id === aluno.id,
                );
                if (!alunoChamada)
                  return (
                    <TableCell className="bg-white text-gray-400 text-center">
                      -
                    </TableCell>
                  );
                return (
                  <TableCell className="text-center text-lg bg-white">
                    {alunoChamada.presenca ? (
                      <span className="flex justify-center items-center h-full">
                        <CheckCircle2Icon className="text-green-500 w-6 h-6" />
                      </span>
                    ) : (
                      <>
                        <Dialog>
                          <DialogTrigger asChild>
                            {alunoChamada.justificativa ? (
                              <Button
                                size={"icon"}
                                variant={"link"}
                                className="rounded-full w-6 h-6 border-2 border-yellow-400 bg-transparent text-yellow-400"
                                onClick={() => {
                                  setJustificativaEdit(
                                    alunoChamada.justificativa || "",
                                  );
                                  setJustificativaEnabled(false);
                                }}>
                                <MinusIcon className="text-yellow-400 w-6 h-6" />
                              </Button>
                            ) : (
                              <Button
                                size={"icon"}
                                variant={"link"}
                                className="rounded-full w-6 h-6 border-2 border-red-500 bg-transparent text-red-500"
                                onClick={() => {
                                  setJustificativaEdit("");
                                  setJustificativaEnabled(false);
                                }}>
                                <X />
                              </Button>
                            )}
                          </DialogTrigger>
                          <DialogContent className="bg-white rounded-xl p-6 shadow-lg w-full max-w-xs">
                            <DialogHeader>
                              <DialogTitle className="text-pink-600">
                                Justificativa
                              </DialogTitle>
                              <DialogDescription>
                                <div className="flex items-center gap-2 mb-2">
                                  <label className="text-pink-700 font-semibold">
                                    Editar justificativa?
                                  </label>
                                  <Switch
                                    checked={justificativaEnabled}
                                    onCheckedChange={setJustificativaEnabled}
                                  />
                                </div>
                                <input
                                  type="text"
                                  className="w-full border rounded px-2 py-1 mt-2"
                                  placeholder="Digite a justificativa..."
                                  value={
                                    justificativaEnabled
                                      ? justificativaEdit
                                      : alunoChamada.justificativa ||
                                        "sem justificativa"
                                  }
                                  onChange={(e) =>
                                    setJustificativaEdit(e.target.value)
                                  }
                                  disabled={!justificativaEnabled}
                                />
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              {justificativaEnabled && (
                                <Button
                                  className="bg-pink-600 text-white font-bold"
                                  onClick={async () => {
                                    // Atualiza justificativa no Firebase
                                    const chamadaDia = chamadas.find(
                                      (c) => c.dia === dia,
                                    );
                                    if (!chamadaDia) return;
                                    const alunoIndex =
                                      chamadaDia.lista.findIndex(
                                        (a) => a.id === aluno.id,
                                      );
                                    if (alunoIndex === -1) return;
                                    const novaLista = [...chamadaDia.lista];
                                    novaLista[alunoIndex] = {
                                      ...novaLista[alunoIndex],
                                      justificativa: justificativaEdit,
                                    };
                                    await updateDoc(
                                      doc(db, "chamadas", chamadaDia.id),
                                      { lista: novaLista },
                                    );
                                    // Atualiza estado local
                                    setChamadas((prev) =>
                                      prev.map((c) =>
                                        c.id === chamadaDia.id
                                          ? { ...c, lista: novaLista }
                                          : c,
                                      ),
                                    );
                                    setJustificativaEnabled(false);
                                  }}>
                                  Salvar
                                </Button>
                              )}
                              <DialogClose asChild>
                                <Button className="bg-pink-200 text-pink-700 font-bold">
                                  Fechar
                                </Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <style>{`
        . {
          font-family: 'Comic Sans MS', 'Baloo 2', 'Quicksand', cursive;
        }
      `}</style>
    </div>
  );
};

export default ChamadasTabela;
