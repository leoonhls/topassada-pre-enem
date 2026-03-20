import React, { useEffect, useRef, useState } from "react";
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
import { CheckCircle2Icon, X, HelpCircle, PencilIcon } from "lucide-react";
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
import { LoadingState } from "@/components/common/LoadingState";
import { capitalizeFirstLetter, getPreferredName } from "@/utils/stringUtils";
import { horarios } from "@/features/schedule/horarios";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

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

type TipoTabela = "alunos" | "professores" | null;

interface ChamadaProfessor {
  id: string;
  materia: string;
  professorTitular: string;
  presenca?: boolean;
  substituto?: string;
  justificativa?: string;
}

interface ChamadaProfessorDocument {
  id: string;
  dia: string;
  weekday: string;
  lista: ChamadaProfessor[];
}

interface ProfessorRow {
  id: string;
  materia: string;
  professorTitular: string;
}

const ChamadasTabela: React.FC = () => {
  const monthInputRef = useRef<HTMLInputElement | null>(null);
  const [tipoTabela, setTipoTabela] = useState<TipoTabela>(null);
  const [openDialog, setOpenDialog] = useState<{
    alunoId: string;
    dia: string;
  } | null>(null);
  const [justificativaEdit, setJustificativaEdit] = useState("");
  const [justificativaEnabled, setJustificativaEnabled] = useState(false);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [chamadas, setChamadas] = useState<ChamadaDocument[]>([]);
  const [dias, setDias] = useState<string[]>([]);
  const [chamadasProfessores, setChamadasProfessores] = useState<
    ChamadaProfessorDocument[]
  >([]);
  const [diasProfessores, setDiasProfessores] = useState<string[]>([]);
  const [professores, setProfessores] = useState<ProfessorRow[]>([]);
  const [loading, setLoading] = useState(false);

  const { userData } = useAuth();
  const canEdit = userData?.nivel === "supervisor" || userData?.nivel === "adm";

  const [editChamadaAlunos, setEditChamadaAlunos] = useState<{
    chamada: ChamadaDocument;
    form: Record<string, ChamadaAluno>;
  } | null>(null);

  const [editChamadaProf, setEditChamadaProf] = useState<{
    chamada: ChamadaProfessorDocument;
    form: Record<string, ChamadaProfessor>;
  } | null>(null);

  const hoje = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const mesAtual = `${hoje.getFullYear()}-${pad(hoje.getMonth() + 1)}`;
  const [selectedMonth, setSelectedMonth] = useState<string>(mesAtual);

  // Busca alunos apenas quando a tabela de alunos for usada
  useEffect(() => {
    const fetchAlunos = async () => {
      if (alunos.length > 0) return;
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
    if (tipoTabela === "alunos") {
      fetchAlunos();
    }
  }, [tipoTabela, alunos.length]);

  // Busca chamadas de alunos apenas do mês selecionado e quando necessário
  useEffect(() => {
    const fetchChamadas = async () => {
      if (tipoTabela !== "alunos") return;
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
  }, [selectedMonth, tipoTabela]);

  // Busca chamadas de professores apenas do mês selecionado e quando necessário
  useEffect(() => {
    const fetchChamadasProfessores = async () => {
      if (tipoTabela !== "professores") return;
      setLoading(true);
      const [yearStr, monthStr] = selectedMonth.split("-");
      const year = Number(yearStr);
      const month = Number(monthStr); // 1-12
      if (!year || !month) {
        setChamadasProfessores([]);
        setDiasProfessores([]);
        setProfessores([]);
        setLoading(false);
        return;
      }

      const firstDay = `${yearStr}-${monthStr}-01`;
      const monthIndex = month - 1; // 0-11
      const lastDate = new Date(year, monthIndex + 1, 0).getDate();
      const lastDay = `${yearStr}-${monthStr}-${pad(lastDate)}`;

      const chamadasProfRef = collection(db, "chamadasProfessores");
      const chamadasProfQuery = query(
        chamadasProfRef,
        where("dia", ">=", firstDay),
        where("dia", "<=", lastDay),
      );
      const chamadasProfSnapshot = await getDocs(chamadasProfQuery);
      const diasProfSet = new Set<string>();
      const chamadasProfList: ChamadaProfessorDocument[] = [];
      const profMap = new Map<string, ProfessorRow>();

      chamadasProfSnapshot.forEach((snap) => {
        const data = snap.data() as Omit<ChamadaProfessorDocument, "id">;
        const dia = data.dia as string;
        if (typeof dia !== "string") return;
        if (!dia.startsWith(`${yearStr}-${monthStr}-`)) return;
        const docItem: ChamadaProfessorDocument = {
          id: snap.id,
          ...data,
        };
        chamadasProfList.push(docItem);
        diasProfSet.add(dia);
        docItem.lista.forEach((item) => {
          const key = `${item.id}|${item.materia}|${item.professorTitular}`;
          if (!profMap.has(key)) {
            profMap.set(key, {
              id: item.id,
              materia: item.materia,
              professorTitular: item.professorTitular,
            });
          }
        });
      });

      const diasProfArray = Array.from(diasProfSet).sort();
      const profArray = Array.from(profMap.values()).sort((a, b) => {
        if (a.id !== b.id) return a.id.localeCompare(b.id);
        return a.professorTitular.localeCompare(b.professorTitular);
      });

      setChamadasProfessores(chamadasProfList);
      setDiasProfessores(diasProfArray);
      setProfessores(profArray);

      setLoading(false);
    };
    fetchChamadasProfessores();
  }, [selectedMonth, tipoTabela]);

  if (loading)
    return <LoadingState label="Carregando chamadas..." fullscreen />;

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

  // Monta tabelas: linhas = alunos ou professores, colunas = dias
  return (
    <div className="bg-card rounded-xl shadow-lg p-4 md:p-6">
      <div className="flex flex-col max-w-xl items-start justify-between gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="flex gap-4 items-end">
          <div className="flex flex-col">
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Painel de presença
            </span>
            <span className="text-2xl font-bold leading-tight text-foreground">
              Tabela de Chamadas
            </span>
          </div>
          <label
            className="relative inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground cursor-pointer"
            onClick={() => {
              const el = monthInputRef.current as any;
              if (el?.showPicker) {
                el.showPicker();
              } else {
                monthInputRef.current?.focus();
              }
            }}>
            <span className="inline-flex h-2 w-2 rounded-full bg-primary/80" />
            <span>{capitalizeFirstLetter(tituloMes)}</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              ref={monthInputRef}
              className="absolute inset-0 opacity-0 pointer-events-none"
            />
          </label>
        </div>
        {!tipoTabela && (
          <span className="flex flex-col text-center items-start md:items-end gap-1 text-xs sm:text-sm text-muted-foreground">
            Escolha se deseja visualizar a tabela de chamadas de alunos ou de
            professores.
          </span>
        )}
        <div className="flex flex-wrap w-full gap-2 mb-2 md:mb-0">
          <Button
            size={"sm"}
            type="button"
            variant={tipoTabela === "alunos" ? "default" : "outline"}
            className="flex flex-1 *:text-xs sm:text-sm"
            onClick={() => setTipoTabela("alunos")}>
            Alunos
          </Button>
          <Button
            size={"sm"}
            type="button"
            variant={tipoTabela === "professores" ? "default" : "outline"}
            className="flex flex-1 text-xs sm:text-sm"
            onClick={() => setTipoTabela("professores")}>
            Professores
          </Button>
        </div>
      </div>

      {tipoTabela === "alunos" && (
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
                const chamadaDiaObj = chamadas.find((c) => c.dia === dia);
                return (
                  <TableHead key={dia} className="text-foreground text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span>{formatted}</span>
                      {canEdit && chamadaDiaObj && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-5 w-5"
                          title="Editar chamada do dia"
                          onClick={() => {
                            const form: Record<string, ChamadaAluno> = {};
                            chamadaDiaObj.lista.forEach((a) => {
                              form[a.id] = { ...a };
                            });
                            setEditChamadaAlunos({ chamada: chamadaDiaObj, form });
                          }}>
                          <PencilIcon className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {alunos.map((aluno) => (
              <TableRow
                key={aluno.id}
                className="hover:bg-muted transition-all">
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
      )}

      {tipoTabela === "professores" && (
        <Table className="rounded-xl border border-border text-center text-xs sm:text-sm mt-4">
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="text-foreground text-lg text-center sticky left-0 z-20 bg-muted">
                Aula / Professor
              </TableHead>
              {diasProfessores.map((dia) => {
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
                const chamadaProfDiaObj = chamadasProfessores.find((c) => c.dia === dia);
                return (
                  <TableHead key={dia} className="text-foreground text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span>{formatted}</span>
                      {canEdit && chamadaProfDiaObj && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-5 w-5"
                          title="Editar chamada do dia"
                          onClick={() => {
                            const form: Record<string, ChamadaProfessor> = {};
                            chamadaProfDiaObj.lista.forEach((p) => {
                              form[p.id] = { ...p };
                            });
                            setEditChamadaProf({ chamada: chamadaProfDiaObj, form });
                          }}>
                          <PencilIcon className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {professores.map((prof) => (
              <TableRow
                key={`${prof.id}-${prof.materia}-${prof.professorTitular}`}
                className="hover:bg-muted transition-all">
                <TableCell className="font-semibold text-primary bg-card text-left sticky left-0 z-10">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">
                      {(() => {
                        const idx = Number(prof.id);
                        const horario =
                          !isNaN(idx) && horarios[idx] ? horarios[idx] : null;
                        return horario
                          ? `${horario[0]} - ${horario[1]}`
                          : `Aula ${Number.isNaN(idx) ? prof.id : idx + 1}`;
                      })()}
                    </span>
                    <span>{prof.materia}</span>
                    <span className="text-xs">{prof.professorTitular}</span>
                  </div>
                </TableCell>
                {diasProfessores.map((dia) => {
                  const chamadaDia = chamadasProfessores.find(
                    (c) => c.dia === dia,
                  );
                  if (!chamadaDia)
                    return (
                      <TableCell className="bg-card text-muted-foreground text-center">
                        -
                      </TableCell>
                    );
                  const profChamada = chamadaDia.lista.find(
                    (p) =>
                      p.id === prof.id &&
                      p.materia === prof.materia &&
                      p.professorTitular === prof.professorTitular,
                  );
                  if (!profChamada)
                    return (
                      <TableCell className="bg-card text-muted-foreground text-center">
                        -
                      </TableCell>
                    );
                  const presenca = profChamada.presenca;
                  return (
                    <TableCell className="text-center text-lg bg-card">
                      {presenca === true ? (
                        <span className="flex justify-center items-center h-full">
                          <CheckCircle2Icon className="text-success w-6 h-6" />
                        </span>
                      ) : presenca === false ? (
                        <>
                          <Dialog>
                            <DialogTrigger asChild>
                              {profChamada.justificativa ? (
                                <Button
                                  size={"icon"}
                                  variant={"link"}
                                  className="rounded-full w-6 h-6 border-2 border-warning bg-transparent text-warning"
                                  onClick={() => {
                                    setJustificativaEdit(
                                      profChamada.justificativa || "",
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
                                        : profChamada.justificativa ||
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
                                      const chamadaDia =
                                        chamadasProfessores.find(
                                          (c) => c.dia === dia,
                                        );
                                      if (!chamadaDia) return;
                                      const itemIndex =
                                        chamadaDia.lista.findIndex(
                                          (p) =>
                                            p.id === prof.id &&
                                            p.materia === prof.materia &&
                                            p.professorTitular ===
                                              prof.professorTitular,
                                        );
                                      if (itemIndex === -1) return;
                                      const novaLista = [...chamadaDia.lista];
                                      novaLista[itemIndex] = {
                                        ...novaLista[itemIndex],
                                        justificativa: justificativaEdit,
                                      };
                                      await updateDoc(
                                        doc(
                                          db,
                                          "chamadasProfessores",
                                          chamadaDia.id,
                                        ),
                                        { lista: novaLista },
                                      );
                                      setChamadasProfessores((prev) =>
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
                      ) : (
                        <span className="flex justify-center items-center h-full text-muted-foreground">
                          <HelpCircle className="w-5 h-5" />
                        </span>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <style>{`
        . {
          font-family: 'Comic Sans MS', 'Baloo 2', 'Quicksand', cursive;
        }
      `}</style>

      {/* Dialog de edição completa - Alunos */}
      <Dialog
        open={!!editChamadaAlunos}
        onOpenChange={(open) => { if (!open) setEditChamadaAlunos(null); }}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar chamada de alunos</DialogTitle>
            <DialogDescription>
              {editChamadaAlunos && (() => {
                const [y, m, d] = editChamadaAlunos.chamada.dia.split("-");
                return `${d}/${m}/${y}`;
              })()}
            </DialogDescription>
          </DialogHeader>
          {editChamadaAlunos && (
            <div className="flex flex-col gap-2">
              {editChamadaAlunos.chamada.lista.map((aluno) => {
                const registro = editChamadaAlunos.form[aluno.id] ?? { ...aluno };
                const presenca = registro.presenca;
                return (
                  <div key={aluno.id} className="rounded-lg border px-3 py-2 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{aluno.nome}</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          className={`px-2 py-1 rounded text-xs font-semibold ${presenca ? "bg-success text-foreground" : "bg-muted"}`}
                          onClick={() =>
                            setEditChamadaAlunos((prev) =>
                              prev ? { ...prev, form: { ...prev.form, [aluno.id]: { ...registro, presenca: true } } } : prev
                            )}>
                          Presente
                        </button>
                        <button
                          type="button"
                          className={`px-2 py-1 rounded text-xs font-semibold ${presenca === false ? "bg-destructive text-destructive-foreground" : "bg-muted"}`}
                          onClick={() =>
                            setEditChamadaAlunos((prev) =>
                              prev ? { ...prev, form: { ...prev.form, [aluno.id]: { ...registro, presenca: false } } } : prev
                            )}>
                          Falta
                        </button>
                      </div>
                    </div>
                    {presenca === false && (
                      <input
                        type="text"
                        className="w-full border rounded px-2 py-1 text-xs"
                        placeholder="Justificativa (opcional)..."
                        value={registro.justificativa || ""}
                        onChange={(e) =>
                          setEditChamadaAlunos((prev) =>
                            prev ? { ...prev, form: { ...prev.form, [aluno.id]: { ...registro, justificativa: e.target.value } } } : prev
                          )
                        }
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              onClick={async () => {
                if (!editChamadaAlunos) return;
                const novaLista = editChamadaAlunos.chamada.lista.map((a) => {
                  const reg = editChamadaAlunos.form[a.id] ?? a;
                  const item: ChamadaAluno = { id: a.id, nome: a.nome, presenca: reg.presenca };
                  if (!item.presenca && reg.justificativa) item.justificativa = reg.justificativa;
                  return item;
                });
                await updateDoc(doc(db, "chamadas", editChamadaAlunos.chamada.id), { lista: novaLista });
                setChamadas((prev) =>
                  prev.map((c) =>
                    c.id === editChamadaAlunos.chamada.id ? { ...c, lista: novaLista } : c,
                  ),
                );
                toast.success("Chamada atualizada!");
                setEditChamadaAlunos(null);
              }}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de edição completa - Professores */}
      <Dialog
        open={!!editChamadaProf}
        onOpenChange={(open) => { if (!open) setEditChamadaProf(null); }}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar chamada de professores</DialogTitle>
            <DialogDescription>
              {editChamadaProf && (() => {
                const [y, m, d] = editChamadaProf.chamada.dia.split("-");
                return `${d}/${m}/${y}`;
              })()}
            </DialogDescription>
          </DialogHeader>
          {editChamadaProf && (
            <div className="flex flex-col gap-2">
              {editChamadaProf.chamada.lista.map((prof) => {
                const registro = editChamadaProf.form[prof.id] ?? { ...prof };
                const presenca = registro.presenca;
                return (
                  <div key={prof.id} className="rounded-lg border px-3 py-2 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-col text-sm">
                        <span className="font-medium">{prof.materia}</span>
                        <span className="text-xs text-muted-foreground">{prof.professorTitular}</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          className={`px-2 py-1 rounded text-xs font-semibold ${presenca ? "bg-success text-foreground" : "bg-muted"}`}
                          onClick={() =>
                            setEditChamadaProf((prev) =>
                              prev ? { ...prev, form: { ...prev.form, [prof.id]: { ...registro, presenca: true } } } : prev
                            )}>
                          Presente
                        </button>
                        <button
                          type="button"
                          className={`px-2 py-1 rounded text-xs font-semibold ${presenca === false ? "bg-destructive text-destructive-foreground" : "bg-muted"}`}
                          onClick={() =>
                            setEditChamadaProf((prev) =>
                              prev ? { ...prev, form: { ...prev.form, [prof.id]: { ...registro, presenca: false } } } : prev
                            )}>
                          Falta
                        </button>
                      </div>
                    </div>
                    {presenca === false && (
                      <div className="space-y-1">
                        <input
                          type="text"
                          className="w-full border rounded px-2 py-1 text-xs"
                          placeholder="Professor substituto (opcional)..."
                          value={registro.substituto || ""}
                          onChange={(e) =>
                            setEditChamadaProf((prev) =>
                              prev ? { ...prev, form: { ...prev.form, [prof.id]: { ...registro, substituto: e.target.value } } } : prev
                            )
                          }
                        />
                        <input
                          type="text"
                          className="w-full border rounded px-2 py-1 text-xs"
                          placeholder="Justificativa (opcional)..."
                          value={registro.justificativa || ""}
                          onChange={(e) =>
                            setEditChamadaProf((prev) =>
                              prev ? { ...prev, form: { ...prev.form, [prof.id]: { ...registro, justificativa: e.target.value } } } : prev
                            )
                          }
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              onClick={async () => {
                if (!editChamadaProf) return;
                const novaLista = editChamadaProf.chamada.lista.map((p) => {
                  const reg = editChamadaProf.form[p.id] ?? p;
                  const item: ChamadaProfessor = {
                    id: p.id,
                    materia: p.materia,
                    professorTitular: p.professorTitular,
                    presenca: reg.presenca,
                  };
                  if (!item.presenca && reg.substituto) item.substituto = reg.substituto;
                  if (!item.presenca && reg.justificativa) item.justificativa = reg.justificativa;
                  return item;
                });
                await updateDoc(doc(db, "chamadasProfessores", editChamadaProf.chamada.id), { lista: novaLista });
                setChamadasProfessores((prev) =>
                  prev.map((c) =>
                    c.id === editChamadaProf.chamada.id ? { ...c, lista: novaLista } : c,
                  ),
                );
                toast.success("Chamada atualizada!");
                setEditChamadaProf(null);
              }}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChamadasTabela;
