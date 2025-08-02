import React, { useEffect, useState } from "react";
import {
  type AulaComDetalhes,
  type QuadroHorario,
  type StatusPresenca,
  DIAS_SEMANA,
  HorarioAula,
  Materia,
  ordenarAulasPorHorario,
  RegistroPresenca,
} from "./horarios";
import {
  atualizarPresenca,
  obterHorarios,
  obterMaterias,
  obterPresencasPorData,
  obterProfessores,
  registrarPresenca,
} from "./horariosService";

import { AulaCard } from "./AulaCard";
import { useFirebaseDocumentCache } from "@/hooks/useFirebaseDocumentCache";
import { Professor } from "../professores/Professor";

interface QuadroHorariosProps {
  data?: Date;
}

const QuadroHorarios: React.FC<QuadroHorariosProps> = ({
  data = new Date(),
}) => {
  const [quadroHorario, setQuadroHorario] = useState<QuadroHorario>({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const { getFromCacheOrFetch: getProfessor } =
    useFirebaseDocumentCache<Professor>("professores");
    const { getFromCacheOrFetch: getHorarios } =
      useFirebaseDocumentCache<HorarioAula>("horarios");
      const { getFromCacheOrFetch: getMaterias } =
      useFirebaseDocumentCache<Materia>("materias"); 
      const { getFromCacheOrFetch: getPresencas } =
      useFirebaseDocumentCache<RegistroPresenca>("presencas");

  const carregarDados = async () => {
    try {
      setCarregando(true);
      setErro(null);

      // Carregar dados base
      const [horariosData, professoresData, materiasData, presencasData] =
        await Promise.all([
          obterHorarios(),
          obterProfessores(),
          obterMaterias(),
          obterPresencasPorData(data),
        ]);

      // Organizar horários por dia da semana
      const quadro: QuadroHorario = {};

      // Inicializar todos os dias
      Object.keys(DIAS_SEMANA).forEach((dia) => {
        quadro[dia] = [];
      });

      // Processar cada horário
      horariosData.forEach((horario) => {
        const professor = professoresData.find(
          (p) => p.id === horario.professorId
        );
        console.log(horario);
        const materia = materiasData.find((m) => m.id === horario.materiaId);
        console.log(materia);

        const presenca = presencasData.find(
          (p) =>
            p.horarioAulaId === horario.id &&
            p.data.getDate() === data.getDate() &&
            p.data.getMonth() === data.getMonth() &&
            p.data.getFullYear() === data.getFullYear()
        );

        if (professor && materia) {
          const aulaComDetalhes: AulaComDetalhes = {
            ...horario,
            professor,
            materia,
            presenca,
          };

          quadro[horario.diaSemana].push(aulaComDetalhes);
        }
      });

      // Ordenar aulas por horário em cada dia
      Object.keys(quadro).forEach((dia) => {
        quadro[dia] = ordenarAulasPorHorario(quadro[dia]);
      });

      setQuadroHorario(quadro);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setErro("Erro ao carregar o quadro de horários");
    } finally {
      setCarregando(false);
    }
  };

  const marcarPresenca = async (
    aula: AulaComDetalhes,
    status: StatusPresenca,
    obs: string
  ) => {
    try {
      if (aula.presenca) {
        // Atualizar presença existente
        await atualizarPresenca(aula.presenca.id, status);
      } else {
        // Criar nova presença
        await registrarPresenca({
          horarioAulaId: aula.id,
          professorId: aula.professorId,
          data,
          status,
          observacoes: obs,
        });
      }

      // Recarregar dados
      await carregarDados();
    } catch (error) {
      console.error("Erro ao marcar presença:", error);
      setErro("Erro ao marcar presença");
    }
  };

  useEffect(() => {
    carregarDados();
  }, [data]);

  if (carregando) {
    return (
      <div>
        <p>Carregando quadro de horários...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="p-5 bg-red-500">
        <p>{erro}</p>
        <button onClick={carregarDados}>Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className="p-5">
      <h2>Quadro de Horários - {data.toLocaleDateString("pt-BR")}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-5">
        {Object.entries(DIAS_SEMANA).map(([dia, nomeDia]) => (
          <div
            key={dia}
            className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-blue-500 text-center py-2 font-bold">
              {nomeDia}
            </div>

            <div className="flex flex-col gap-3 p-4">
              {quadroHorario[dia]?.length > 0 ? (
                quadroHorario[dia].map((aula) => (
                  <AulaCard
                    key={aula.id}
                    aula={aula}
                    onMarcarPresenca={marcarPresenca}
                  />
                ))
              ) : (
                <p className="flex items-center justify-center w-full">
                  Nenhuma aula agendada
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuadroHorarios;
