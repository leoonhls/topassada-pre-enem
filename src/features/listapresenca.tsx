import React, { useState, useEffect } from "react";
import {
  obterHorarios,
  obterProfessores,
  obterMaterias,
  obterPresencasPorData,
  registrarPresenca,
  atualizarPresenca,
} from "./horarios/horariosService";
import {
  type AulaComDetalhes,
  type QuadroHorario,
  type StatusPresenca,
  DIAS_SEMANA,
  STATUS_PRESENCA,
  obterCorStatus,
  ordenarAulasPorHorario,
} from "./horarios/horarios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuadroHorariosProps {
  data?: Date;
}

const QuadroHorarios: React.FC<QuadroHorariosProps> = ({
  data = new Date(),
}) => {
  const [quadroHorario, setQuadroHorario] = useState<QuadroHorario>({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

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
        const materia = materiasData.find((m) => m.id === horario.materiaId);
        const presenca = presencasData.find(
          (p) => p.horarioAulaId === horario.id
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
    status: StatusPresenca
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
                <p
                  style={{
                    color: "#999",
                    textAlign: "center",
                    margin: "20px 0",
                  }}>
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

interface AulaCardProps {
  aula: AulaComDetalhes;
  onMarcarPresenca: (aula: AulaComDetalhes, status: StatusPresenca) => void;
}

const AulaCard: React.FC<AulaCardProps> = ({ aula, onMarcarPresenca }) => {
  return (
    <Card>
      <CardHeader>
        <div className="font-bold text-sm">
          {aula.horaInicio} - {aula.horaFim}
        </div>
        <div className="text-sm">{aula.materia.nome}</div>
        <div>Prof. {aula.professor.nome}</div>
        {aula.sala && <div>Sala: {aula.sala}</div>}
      </CardHeader>

      <CardContent>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              Marcar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(Object.keys(STATUS_PRESENCA) as StatusPresenca[]).map(
              (status) => (
                <DropdownMenuItem
                  onClick={() => {
                    onMarcarPresenca(aula, status);
                  }}>
                  {STATUS_PRESENCA[status]}
                </DropdownMenuItem>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>

      {aula.presenca?.observacoes && <div>{aula.presenca.observacoes}</div>}
    </Card>
  );
};

export default QuadroHorarios;
