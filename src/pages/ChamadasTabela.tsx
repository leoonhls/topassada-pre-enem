import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
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
import { capitalizeFirstLetter, getPreferredName } from "@/utils/stringUtils";

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

  const hoje = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const mesAtual = `${hoje.getFullYear()}-${pad(hoje.getMonth() + 1)}`;
  const [selectedMonth, setSelectedMonth] = useState<string>(mesAtual);

  // Busca alunos uma vez
  useEffect(() => {
    const fetchAlunos = async () => {
      setLoading(true);
      const alunosSnapshot = await getDocs(collection(db, "alunos"));
      const alunosList: Aluno[] = [];
      alunosSnapshot.forEach((doc) => {
        alunosList.push({ id: doc.id, ...doc.data() } as Aluno);
      });
      alunosList.sort((a, b) => a.nome.localeCompare(b.nome));
      setAlunos(alunosList);
      setLoading(false);
    };
    fetchAlunos();
  }, []);

  // Busca chamadas apenas do mês selecionado
  useEffect(() => {
    const fetchChamadas = async () => {
      setLoading(true);
      const [yearStr, monthStr] = selectedMonth.split("-");
      const year = Number(yearStr);
      const month = Number(monthStr); // 1-12
      if (!year || !month) {
        setChamadas([]);
        setDias([]);
        setLoading(false);
        return;
      }

      const firstDay = `${yearStr}-${monthStr}-01`;
      const monthIndex = month - 1; // 0-11
      const lastDate = new Date(year, monthIndex + 1, 0).getDate();
      const lastDay = `${yearStr}-${monthStr}-${pad(lastDate)}`;

      const chamadasRef = collection(db, "chamadas");
      const chamadasQuery = query(
        chamadasRef,
        where("dia", ">=", firstDay),
        where("dia", "<=", lastDay),
      );
      const chamadasSnapshot = await getDocs(chamadasQuery);
      const diasSet = new Set<string>();
      const chamadasList: ChamadaDocument[] = [];
      chamadasSnapshot.forEach((snap) => {
        const data = snap.data();
        const dia = data.dia as string;
        if (typeof dia !== "string") return;
        // Garante que o dia realmente pertença ao mês selecionado (evita 31/01 em fevereiro, por exemplo)
        if (!dia.startsWith(`${yearStr}-${monthStr}-`)) return;
        chamadasList.push({ id: snap.id, dia, lista: data.lista });
        diasSet.add(dia);
      });
      const diasArray = Array.from(diasSet).sort();
      setChamadas(chamadasList);
      setDias(diasArray);
      setLoading(false);
    };
    fetchChamadas();
  }, [selectedMonth]);

  if (loading) return <div>Carregando...</div>;

  let tituloMes = "";
  try {
    const [yearStr, monthStr] = selectedMonth.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr); // 1-12
    const d = new Date(year, month - 1, 1);
    tituloMes = d.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
  } catch {
    tituloMes = selectedMonth;
  }

  // Monta tabela: linhas = alunos, colunas = dias
  return (
    <div className="bg-card rounded-xl shadow-lg p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="flex items-center gap-2 text-sm">
          <input
            type="month"
            value={capitalizeFirstLetter(selectedMonth)}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-border rounded px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      <Table className="rounded-xl border border-border text-center text-xs sm:text-sm">
        <TableHeader>
          <TableRow className="bg-muted">
            <TableHead className="text-foreground text-lg text-center sticky left-0 z-20 bg-muted"></TableHead>
            {dias.map((dia) => {
              let formatted = dia;
              try {
                const [yearStr, monthStr, dayStr] = dia.split("-");
                if (yearStr && monthStr && dayStr) {
                  const day = dayStr.padStart(2, "0");
                  const month = monthStr.padStart(2, "0");
                  const year = yearStr.slice(-2);
                  formatted = `${day}/${month}/${year}`;
                }
              } catch {
                formatted = dia;
              }
              return (
                <TableHead key={dia} className="text-foreground text-center">
                  {formatted}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {alunos.map((aluno) => (
            <TableRow key={aluno.id} className="hover:bg-muted transition-all">
              <TableCell className="font-semibold text-primary bg-card text-left sticky left-0 z-10">
                {getPreferredName(aluno.nome, (aluno as any).nome_social)}
              </TableCell>
              {dias.map((dia) => {
                const chamadaDia = chamadas.find((c) => c.dia === dia);
                if (!chamadaDia)
                  return (
                    <TableCell className="bg-card text-muted-foreground text-center">
                      -
                    </TableCell>
                  );
                const alunoChamada = chamadaDia.lista.find(
                  (a) => a.id === aluno.id,
                );
                if (!alunoChamada)
                  return (
                    <TableCell className="bg-card text-muted-foreground text-center">
                      -
                    </TableCell>
                  );
                return (
                  <TableCell className="text-center text-lg bg-card">
                    {alunoChamada.presenca ? (
                      <span className="flex justify-center items-center h-full">
                        <CheckCircle2Icon className="text-success w-6 h-6" />
                      </span>
                    ) : (
                      <>
                        <Dialog>
                          <DialogTrigger asChild>
                            {alunoChamada.justificativa ? (
                              <Button
                                size={"icon"}
                                variant={"link"}
                                className="rounded-full w-6 h-6 border-2 border-warning bg-transparent text-warning"
                                onClick={() => {
                                  setJustificativaEdit(
                                    alunoChamada.justificativa || "",
                                  );
                                  setJustificativaEnabled(false);
                                }}>
                                <MinusIcon className="text-warning w-6 h-6" />
                              </Button>
                            ) : (
                              <Button
                                size={"icon"}
                                variant={"link"}
                                className="rounded-full w-6 h-6 border-2 border-destructive bg-transparent text-destructive"
                                onClick={() => {
                                  setJustificativaEdit("");
                                  setJustificativaEnabled(false);
                                }}>
                                <X />
                              </Button>
                            )}
                          </DialogTrigger>
                          <DialogContent className="bg-card rounded-xl p-6 shadow-lg w-full max-w-xs">
                            <DialogHeader>
                              <DialogTitle className="text-primary">
                                Justificativa
                              </DialogTitle>
                              <DialogDescription>
                                <div className="flex items-center gap-2 mb-2">
                                  <label className="text-foreground font-semibold">
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
                                  className="bg-primary text-primary-foreground font-bold"
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
                                <Button className="bg-secondary text-secondary-foreground font-bold">
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
