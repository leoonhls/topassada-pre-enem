// Tipos para o sistema de horários

import { Professor } from "../professor/Professor";


export interface Materia {
  id: string;
  nome: string;
  cor: string; // Para diferenciação visual no quadro
  cargaHoraria: number; // horas por semana
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface HorarioAula {
  id: string;
  professorId: string;
  materiaId: string;
  diaSemana: DiaSemana;
  horaInicio: string; // formato "HH:mm"
  horaFim: string; // formato "HH:mm"
  sala?: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface RegistroPresenca {
  id: string;
  horarioAulaId: string;
  professorId: string;
  data: Date;
  status: StatusPresenca;
  observacoes?: string;
  registradoPor?: string; // ID do usuário que registrou
  registradoEm: Date;
}

// Tipos para dias da semana
export type DiaSemana =
  | "segunda"
  | "terca"
  | "quarta"
  | "quinta"
  | "sexta"
  | "sabado";

export const DIAS_SEMANA: Record<DiaSemana, string> = {
  segunda: "Segunda-feira",
  terca: "Terça-feira",
  quarta: "Quarta-feira",
  quinta: "Quinta-feira",
  sexta: "Sexta-feira",
  sabado: "Sábado",
} as const;

// Tipos para status de presença
export type StatusPresenca =
  | "presente"
  | "falta"
  | "atraso"
  | "falta_justificada";

export const STATUS_PRESENCA: Record<StatusPresenca, string> = {
  presente: "Presente",
  falta: "Falta",
  atraso: "Atraso",
  falta_justificada: "Falta Justificada",
} as const;

// Tipos para exibição
export interface AulaComDetalhes extends HorarioAula {
  professor: Professor;
  materia: Materia;
  presenca?: RegistroPresenca;
}

export interface QuadroHorario {
  [key: string]: AulaComDetalhes[]; // key = DiaSemana
}

// Utilitários para formatação
export const formatarHora = (hora: string): string => {
  return hora;
};

export const obterDiaAtual = (): DiaSemana => {
  const hoje = new Date();
  const diaSemana = hoje.getDay();

  switch (diaSemana) {
    case 1:
      return "segunda";
    case 2:
      return "terca";
    case 3:
      return "quarta";
    case 4:
      return "quinta";
    case 5:
      return "sexta";
    case 6:
      return "sabado";
    default:
      return "segunda";
  }
};

export const obterCorStatus = (status: StatusPresenca): string => {
  switch (status) {
    case "presente":
      return "#4CAF50"; // Verde
    case "falta":
      return "#F44336"; // Vermelho
    case "atraso":
      return "#FF9800"; // Laranja
    case "falta_justificada":
      return "#2196F3"; // Azul
    default:
      return "#9E9E9E"; // Cinza
  }
};

export const ordenarAulasPorHorario = (
  aulas: AulaComDetalhes[]
): AulaComDetalhes[] => {
  return aulas.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
};
