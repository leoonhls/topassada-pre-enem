import React, { useEffect, useRef, useState } from "react";
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
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";
import { capitalizeFirstLetter, getPreferredName } from "@/utils/stringUtils";
import { useUsers } from "@/features/user/useUsers";
import { horarios } from "@/features/schedule/horarios";
import { useIsMobile } from "@/hooks/useMobile";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/common/LoadingState";

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

type TipoChamada = "alunos" | "professores" | null;

interface ProfessorLesson {
  id: string;
  materia: string;
  professorTitular: string;
}

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
  quemFez: string;
  timestamp: any;
  lista: ChamadaProfessor[];
}

const NovaChamada: React.FC = () => {
  const monthInputRef = useRef<HTMLInputElement | null>(null);

  const [tipoChamada, setTipoChamada] = useState<TipoChamada>(null);
  const [chamadaExistente, setChamadaExistente] =
    useState<ChamadaDocument | null>(null);
  const [chamadaProfExistente, setChamadaProfExistente] =
    useState<ChamadaProfessorDocument | null>(null);
  const [editavel, setEditavel] = useState(true);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [chamada, setChamada] = useState<Record<string, ChamadaAluno>>({});
  const [professoresDia, setProfessoresDia] = useState<ProfessorLesson[]>([]);
  const [chamadaProf, setChamadaProf] = useState<
    Record<string, ChamadaProfessor>
  >({});
  const [professorOptions, setProfessorOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const { fetchUserAsync } = useUsers();
  const hoje = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const dataHoje = `${hoje.getFullYear()}-${pad(hoje.getMonth() + 1)}-${pad(hoje.getDate())}`;
  const [dia, setDia] = useState<string>(dataHoje);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchAlunos = async () => {
      const alunosRef = collection(db, "alunos");
      const alunosQuery = query(alunosRef, where("active", "==", true));
      const querySnapshot = await getDocs(alunosQuery);
      const alunosList: Aluno[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data() as Omit<Aluno, "id">;
        alunosList.push({ id: docSnap.id, ...data });
      });
      setAlunos(alunosList);
    };

    const fetchProfessores = async () => {
      const res = await fetchUserAsync();
      setProfessorOptions(
        res.items
          .filter((u) => (u as any).nivel === "professor")
          .map((u) => (u as any).nome_social || u.name),
      );
    };

    setLoading(true);
    Promise.all([fetchAlunos(), fetchProfessores()]).finally(() =>
      setLoading(false),
    );
  }, []);

  useEffect(() => {
    const getWeekdayKey = (dateStr: string) => {
      const [year, month, day] = dateStr.split("-").map((v) => parseInt(v, 10));
      const d = new Date(year, month - 1, day);
      const weekday = d.getDay(); // 0 domingo, 1 segunda, ...
      switch (weekday) {
        case 1:
          return "segunda";
        case 2:
          return "terça";
        case 3:
          return "quarta";
        case 4:
          return "quinta";
        case 5:
          return "sexta";
        default:
          return "";
      }
    };

    const checkChamadaAlunos = async () => {
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
        setChamada({});
      }
    };

    const checkChamadaProfessores = async () => {
      const weekdayKey = getWeekdayKey(dia);
      // Carrega professores do dia a partir do schedule
      if (!weekdayKey) {
        setProfessoresDia([]);
      } else {
        const docRef = doc(collection(db, "schedules"), weekdayKey);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Record<
            string,
            { materia: string; professor: string }
          >;
          const lessons = Object.keys(data)
            .filter((key) => !isNaN(Number(key)))
            .sort((a, b) => Number(a) - Number(b))
            .map((key) => ({
              id: key,
              materia: data[key].materia,
              professorTitular: data[key].professor,
            }));
          setProfessoresDia(lessons);
        } else {
          setProfessoresDia([]);
        }
      }

      // Verifica se já existe chamada de professores para o dia
      const chamadasProfRef = collection(db, "chamadasProfessores");
      const chamadasProfQuery = query(chamadasProfRef, where("dia", "==", dia));
      const querySnapshot = await getDocs(chamadasProfQuery);
      let encontradaProf: ChamadaProfessorDocument | null = null;
      querySnapshot.forEach((snap) => {
        const data = snap.data() as Omit<ChamadaProfessorDocument, "id">;
        encontradaProf = { id: snap.id, ...data };
      });
      setChamadaProfExistente(encontradaProf);
      setEditavel(!encontradaProf);

      if (encontradaProf) {
        const docProf = encontradaProf as ChamadaProfessorDocument;
        const chamadaObj: Record<string, ChamadaProfessor> = {};
        docProf.lista.forEach((item: ChamadaProfessor) => {
          chamadaObj[item.id] = { ...item };
        });
        setChamadaProf(chamadaObj);
      } else {
        setChamadaProf({});
      }
    };

    // Só carrega dados específicos depois que o usuário escolher o tipo
    if (!tipoChamada) {
      setChamadaExistente(null);
      setChamadaProfExistente(null);
      setChamada({});
      setChamadaProf({});
      return;
    }

    setLoading(true);
    if (tipoChamada === "alunos") {
      checkChamadaAlunos().finally(() => setLoading(false));
    } else {
      checkChamadaProfessores().finally(() => setLoading(false));
    }
  }, [dia, tipoChamada]);

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

  const handlePresencaProfessor = (id: string, presenca: boolean) => {
    setChamadaProf((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        presenca,
      },
    }));
  };

  const handleSubstitutoProfessor = (id: string, substituto: string) => {
    setChamadaProf((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        substituto,
      },
    }));
  };

  const handleJustificativaProfessor = (id: string, justificativa: string) => {
    setChamadaProf((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        justificativa,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tipoChamada === "alunos") {
      const todosRespondidos = alunos.every(
        (aluno) => typeof chamada[aluno.id]?.presenca === "boolean",
      );
      if (!todosRespondidos) {
        alert(
          "Preencha presença ou falta para todos os alunos antes de salvar.",
        );
        return;
      }

      const chamadaList = alunos.map((aluno) => {
        const presencaFlag = chamada[aluno.id]?.presenca;
        const presenca = presencaFlag ?? false;
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
        await updateDoc(doc(db, "chamadas", chamadaExistente.id), {
          timestamp: Timestamp.now(),
          quemFez: currentUser?.email || "desconhecido",
          lista: chamadaList,
        });
        alert("Chamada de alunos atualizada com sucesso!");
      } else {
        await addDoc(collection(db, "chamadas"), {
          timestamp: Timestamp.now(),
          dia,
          quemFez: currentUser?.email || "desconhecido",
          lista: chamadaList,
        });
        alert("Chamada de alunos registrada com sucesso!");
      }
      setChamada({});
    } else if (tipoChamada === "professores") {
      const chamadaListProf = professoresDia.map((prof) => {
        const presencaFlag = chamadaProf[prof.id]?.presenca;
        const substituto = chamadaProf[prof.id]?.substituto;
        const justificativa =
          presencaFlag === false && chamadaProf[prof.id]?.justificativa
            ? chamadaProf[prof.id]?.justificativa
            : undefined;

        const item: ChamadaProfessor = {
          id: prof.id,
          materia: prof.materia,
          professorTitular: prof.professorTitular,
        };
        if (typeof presencaFlag === "boolean") {
          item.presenca = presencaFlag;
        }
        if (substituto) {
          item.substituto = substituto;
        }
        if (
          justificativa !== undefined &&
          justificativa !== null &&
          justificativa !== ""
        ) {
          item.justificativa = justificativa;
        }
        return item;
      });

      if (chamadaProfExistente) {
        await updateDoc(
          doc(db, "chamadasProfessores", chamadaProfExistente.id),
          {
            timestamp: Timestamp.now(),
            quemFez: currentUser?.email || "desconhecido",
            lista: chamadaListProf,
          },
        );
        alert("Chamada de professores atualizada com sucesso!");
      } else {
        const [year, month, day] = dia.split("-").map((v) => parseInt(v, 10));
        const d = new Date(year, month - 1, day);
        const weekday = d.toLocaleDateString("pt-BR", { weekday: "long" });

        await addDoc(collection(db, "chamadasProfessores"), {
          timestamp: Timestamp.now(),
          dia,
          weekday,
          quemFez: currentUser?.email || "desconhecido",
          lista: chamadaListProf,
        });
        alert("Chamada de professores registrada com sucesso!");
      }
      setChamadaProf({});
    }
  };

  let tituloData = "";
  try {
    const [yearStr, monthStr, dayStr] = dia.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr); // 1-12
    const day = Number(dayStr);
    const dataObj = new Date(year, month - 1, day);
    tituloData = dataObj.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    tituloData = dia;
  }

  if (loading)
    return <LoadingState label="Carregando dados da chamada..." fullscreen />;

  return (
    <div className="bg-card rounded-xl shadow-lg p-4 md:p-6">
      <div className="flex flex-col max-w-xl justify-between gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="flex gap-4 items-end">
          <div className="flex flex-col">
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Painel de presença
            </span>
            <span className="text-2xl font-bold leading-tight text-foreground">
              Fazer chamada
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
            <span>{capitalizeFirstLetter(tituloData)}</span>
            <input
              type="date"
              value={dia}
              onChange={(e) => setDia(e.target.value)}
              max={dataHoje}
              ref={monthInputRef}
              className="absolute inset-0 opacity-0 pointer-events-none"
            />
          </label>
        </div>
        {!tipoChamada && (
          <span className="flex flex-col text-center items-start md:items-end gap-1 text-xs sm:text-sm text-muted-foreground">
            Escolha se deseja fazer a chamada de alunos ou de professores.
          </span>
        )}
        <div className="flex flex-wrap w-full gap-2 mb-2 md:mb-0">
          <Button
            size={"sm"}
            variant={tipoChamada === "alunos" ? "default" : "outline"}
            className="flex flex-1 text-xs sm:text-sm"
            onClick={() => {
              setTipoChamada("alunos");
              setEditavel(true);
            }}>
            Alunos
          </Button>
          <Button
            size={"sm"}
            type="button"
            variant={tipoChamada === "professores" ? "default" : "outline"}
            className="flex flex-1 text-xs sm:text-sm"
            onClick={() => {
              setTipoChamada("professores");
              setEditavel(true);
            }}>
            Professores
          </Button>
        </div>

        {tipoChamada === "alunos" && chamadaExistente && (
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
        {tipoChamada === "professores" && chamadaProfExistente && (
          <div className="mb-4 flex items-center gap-4">
            <span className="text-destructive font-semibold">
              Já existe chamada de professores para o dia selecionado.
            </span>
            <div className="flex items-center gap-2">
              <Switch
                checked={editavel}
                onCheckedChange={setEditavel}
                id="switch-editavel-professores"
              />
              <label
                htmlFor="switch-editavel-professores"
                className="text-sm font-medium">
                Habilitar edição
              </label>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <fieldset disabled={!editavel}>
            {tipoChamada === "alunos" && (
              <>
                {isMobile ? (
                  <div className="mb-4 space-y-2">
                    {alunos.map((aluno) => {
                      const registro = chamada[aluno.id];
                      const presenca = registro?.presenca;
                      return (
                        <div
                          key={aluno.id}
                          className="rounded-xl border bg-card px-3 py-2 space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate">
                                {getPreferredName(
                                  aluno.nome,
                                  (aluno as any).nome_social,
                                )}
                              </p>
                            </div>
                            <div className="flex-shrink-0 flex gap-1">
                              <button
                                type="button"
                                className={`px-3 py-2 rounded text-xs font-semibold ${presenca ? "bg-success text-foreground" : "bg-muted"}`}
                                onClick={() => handlePresenca(aluno.id, true)}>
                                Presente
                              </button>
                              <button
                                type="button"
                                className={`px-3 py-2 rounded text-xs font-semibold ${presenca === false ? "bg-destructive text-destructive-foreground" : "bg-muted"}`}
                                onClick={() => handlePresenca(aluno.id, false)}>
                                Falta
                              </button>
                            </div>
                          </div>
                          {presenca === false && (
                            <div className="space-y-1">
                              <label className="text-xs font-medium">
                                Justificativa
                              </label>
                              <input
                                type="text"
                                className="w-full border rounded px-2 py-1 text-xs"
                                placeholder="Digite a justificativa..."
                                value={registro?.justificativa || ""}
                                onChange={(e) =>
                                  handleJustificativa(aluno.id, e.target.value)
                                }
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="w-full overflow-x-auto mb-4 rounded-xl border">
                    <Table className="text-sm">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="border px-2 py-1 sticky left-0 bg-card z-10">
                            Nome
                          </TableHead>
                          <TableHead className="border px-2 py-1">
                            Presença
                          </TableHead>
                          <TableHead className="border px-2 py-1">
                            Justificativa (quando falta)
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {alunos.map((aluno) => (
                          <TableRow key={aluno.id}>
                            <TableCell className="border px-2 py-1 sticky left-0 bg-card z-10">
                              {getPreferredName(
                                aluno.nome,
                                (aluno as any).nome_social,
                              )}
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
                            <TableCell className="border px-2 py-1">
                              <input
                                type="text"
                                className="w-full border rounded px-2 py-1 text-xs"
                                placeholder="Digite a justificativa..."
                                value={chamada[aluno.id]?.justificativa || ""}
                                onChange={(e) =>
                                  handleJustificativa(aluno.id, e.target.value)
                                }
                                disabled={chamada[aluno.id]?.presenca !== false}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </>
            )}
            {tipoChamada === "professores" && (
              <>
                {isMobile ? (
                  <div className="mb-4 space-y-3">
                    {professoresDia.length === 0 && (
                      <div className="rounded-xl border bg-card px-3 py-2 text-center text-sm text-muted-foreground">
                        Nenhum professor cadastrado para este dia na grade.
                      </div>
                    )}
                    {professoresDia.map((prof, index) => {
                      const horario = horarios[index];
                      const registro = chamadaProf[prof.id];
                      const presenca = registro?.presenca;
                      return (
                        <div
                          key={prof.id}
                          className="rounded-xl border bg-card px-3 py-2 space-y-2">
                          <div>
                            {horario && (
                              <p className="text-xs text-muted-foreground">
                                {horario[0]} - {horario[1]}
                              </p>
                            )}
                            <p className="font-semibold text-sm">
                              {prof.materia}
                            </p>
                            <p className="text-xs">{prof.professorTitular}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className={`flex-1 px-3 py-2 rounded text-xs font-semibold ${presenca ? "bg-success text-foreground" : "bg-muted"}`}
                              onClick={() =>
                                handlePresencaProfessor(prof.id, true)
                              }>
                              Presente
                            </button>
                            <button
                              type="button"
                              className={`flex-1 px-3 py-2 rounded text-xs font-semibold ${presenca === false ? "bg-destructive text-destructive-foreground" : "bg-muted"}`}
                              onClick={() =>
                                handlePresencaProfessor(prof.id, false)
                              }>
                              Falta
                            </button>
                          </div>
                          {presenca === false && (
                            <>
                              <div className="space-y-1">
                                <label className="text-xs font-medium">
                                  Professor substituto (opcional)
                                </label>
                                <select
                                  className="border rounded px-2 py-1 w-full bg-background text-xs"
                                  value={registro?.substituto || ""}
                                  onChange={(e) =>
                                    handleSubstitutoProfessor(
                                      prof.id,
                                      e.target.value,
                                    )
                                  }>
                                  <option value="">Selecione...</option>
                                  {professorOptions.map((nome) => (
                                    <option key={nome} value={nome}>
                                      {nome}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-medium">
                                  Justificativa (quando falta)
                                </label>
                                <input
                                  type="text"
                                  className="w-full border rounded px-2 py-1 text-xs"
                                  placeholder="Digite a justificativa..."
                                  value={registro?.justificativa || ""}
                                  onChange={(e) =>
                                    handleJustificativaProfessor(
                                      prof.id,
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="w-full overflow-x-auto mb-4 rounded-xl border">
                    <Table className=" text-sm">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="border px-2 py-1 sticky left-0 bg-card z-10">
                            Horário / Matéria / Professor
                          </TableHead>
                          <TableHead className="border px-2 py-1">
                            Presença
                          </TableHead>
                          <TableHead className="border px-2 py-1">
                            Professor substituto (opcional)
                          </TableHead>
                          <TableHead className="border px-2 py-1">
                            Justificativa (quando falta)
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {professoresDia.length === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="border px-2 py-2 text-center text-muted-foreground">
                              Nenhum professor cadastrado para este dia na
                              grade.
                            </TableCell>
                          </TableRow>
                        )}
                        {professoresDia.map((prof, index) => {
                          const horario = horarios[index];
                          const registro = chamadaProf[prof.id];
                          const presenca = registro?.presenca;
                          return (
                            <TableRow key={prof.id}>
                              <TableCell className="border px-2 py-1 sticky left-0 bg-card z-10">
                                <div className="flex flex-col">
                                  {horario && (
                                    <span className="text-xs text-muted-foreground">
                                      {horario[0]} - {horario[1]}
                                    </span>
                                  )}
                                  <span className="font-semibold">
                                    {prof.materia}
                                  </span>
                                  <span className="text-xs">
                                    {prof.professorTitular}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="border px-2 py-1 text-center">
                                <button
                                  type="button"
                                  className={`mr-2 px-2 py-1 rounded ${presenca ? "bg-success text-foreground" : "bg-muted"}`}
                                  onClick={() =>
                                    handlePresencaProfessor(prof.id, true)
                                  }>
                                  ✓
                                </button>
                                <button
                                  type="button"
                                  className={`px-2 py-1 rounded ${presenca === false ? "bg-destructive text-destructive-foreground" : "bg-muted"}`}
                                  onClick={() =>
                                    handlePresencaProfessor(prof.id, false)
                                  }>
                                  X
                                </button>
                              </TableCell>
                              <TableCell className="border px-2 py-1 text-center">
                                <select
                                  className="border rounded px-2 py-1 w-full bg-background"
                                  value={registro?.substituto || ""}
                                  onChange={(e) =>
                                    handleSubstitutoProfessor(
                                      prof.id,
                                      e.target.value,
                                    )
                                  }>
                                  <option value="">Selecione...</option>
                                  {professorOptions.map((nome) => (
                                    <option key={nome} value={nome}>
                                      {nome}
                                    </option>
                                  ))}
                                </select>
                              </TableCell>
                              <TableCell className="border px-2 py-1 text-center">
                                <input
                                  type="text"
                                  className="w-full border rounded px-2 py-1"
                                  placeholder="Digite a justificativa..."
                                  value={registro?.justificativa || ""}
                                  onChange={(e) =>
                                    handleJustificativaProfessor(
                                      prof.id,
                                      e.target.value,
                                    )
                                  }
                                  disabled={presenca}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </>
            )}
            {tipoChamada && (
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={!editavel}>
                Salvar Chamada
              </button>
            )}
          </fieldset>
        </form>
      </div>
    </div>
  );
};

export default NovaChamada;
