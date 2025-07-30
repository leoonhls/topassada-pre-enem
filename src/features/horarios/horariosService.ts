import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import type {
  Materia,
  HorarioAula,
  RegistroPresenca,
  DiaSemana,
  StatusPresenca,
} from "./horarios";
import { db } from "@/firebase/config";
import { Professor } from "../professores/Professor";

// Collections
const professoresCollection = collection(db, "professores");
const materiasCollection = collection(db, "materias");
const horariosCollection = collection(db, "horarios");
const presencasCollection = collection(db, "presencas");

// Funções para Professores
export const criarProfessor = async (
  professorData: Omit<Professor, "id" | "createdAt">
): Promise<string> => {
  const agora = new Date();
  const docRef = await addDoc(professoresCollection, {
    ...professorData,
    criadoEm: Timestamp.fromDate(agora),
    atualizadoEm: Timestamp.fromDate(agora),
  });
  return docRef.id;
};

export const obterProfessores = async (): Promise<Professor[]> => {
  const snapshot = await getDocs(query(professoresCollection, orderBy("name")));
  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().criadoEm.toDate(),
      } as Professor)
  );
};

export const obterProfessor = async (id: string): Promise<Professor | null> => {
  const docRef = doc(professoresCollection, id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...snapshot.data(),
    createdAt: snapshot.data().criadoEm.toDate(),
  } as Professor;
};

export const atualizarProfessor = async (
  id: string,
  professorData: Partial<Omit<Professor, "id" | "createdAt">>
): Promise<void> => {
  const docRef = doc(professoresCollection, id);
  await updateDoc(docRef, {
    ...professorData,
    atualizadoEm: Timestamp.fromDate(new Date()),
  });
};

export const deletarProfessor = async (id: string): Promise<void> => {
  const docRef = doc(professoresCollection, id);
  await deleteDoc(docRef);
};

// Funções para Matérias
export const criarMateria = async (
  materiaData: Omit<Materia, "id" | "criadoEm" | "atualizadoEm">
): Promise<string> => {
  const agora = new Date();
  const docRef = await addDoc(materiasCollection, {
    ...materiaData,
    criadoEm: Timestamp.fromDate(agora),
    atualizadoEm: Timestamp.fromDate(agora),
  });
  return docRef.id;
};

export const obterMaterias = async (): Promise<Materia[]> => {
  const snapshot = await getDocs(query(materiasCollection, orderBy("nome")));
  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
        criadoEm: doc.data().criadoEm.toDate(),
        atualizadoEm: doc.data().atualizadoEm.toDate(),
      } as Materia)
  );
};

export const atualizarMateria = async (
  id: string,
  materiaData: Partial<Omit<Materia, "id" | "criadoEm" | "atualizadoEm">>
): Promise<void> => {
  const docRef = doc(materiasCollection, id);
  await updateDoc(docRef, {
    ...materiaData,
    atualizadoEm: Timestamp.fromDate(new Date()),
  });
};

export const deletarMateria = async (id: string): Promise<void> => {
  const docRef = doc(materiasCollection, id);
  await deleteDoc(docRef);
};

// Funções para Horários
export const criarHorario = async (
  horarioData: Omit<HorarioAula, "id" | "criadoEm" | "atualizadoEm">
): Promise<string> => {
  const agora = new Date();
  const docRef = await addDoc(horariosCollection, {
    ...horarioData,
    criadoEm: Timestamp.fromDate(agora),
    atualizadoEm: Timestamp.fromDate(agora),
  });
  return docRef.id;
};

export const obterHorarios = async (): Promise<HorarioAula[]> => {
  const snapshot = await getDocs(
    query(horariosCollection, orderBy("diaSemana"), orderBy("horaInicio"))
  );
  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
        criadoEm: doc.data().criadoEm.toDate(),
        atualizadoEm: doc.data().atualizadoEm.toDate(),
      } as HorarioAula)
  );
};

export const obterHorariosPorDia = async (
  dia: DiaSemana
): Promise<HorarioAula[]> => {
  const q = query(
    horariosCollection,
    where("diaSemana", "==", dia),
    orderBy("horaInicio")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
        criadoEm: doc.data().criadoEm.toDate(),
        atualizadoEm: doc.data().atualizadoEm.toDate(),
      } as HorarioAula)
  );
};

export const atualizarHorario = async (
  id: string,
  horarioData: Partial<Omit<HorarioAula, "id" | "criadoEm" | "atualizadoEm">>
): Promise<void> => {
  const docRef = doc(horariosCollection, id);
  await updateDoc(docRef, {
    ...horarioData,
    atualizadoEm: Timestamp.fromDate(new Date()),
  });
};

export const deletarHorario = async (id: string): Promise<void> => {
  const docRef = doc(horariosCollection, id);
  await deleteDoc(docRef);
};

// Funções para Presença
export const registrarPresenca = async (
  presencaData: Omit<RegistroPresenca, "id" | "registradoEm">
): Promise<string> => {
  const docRef = await addDoc(presencasCollection, {
    ...presencaData,
    data: Timestamp.fromDate(presencaData.data),
    registradoEm: Timestamp.fromDate(new Date()),
  });
  return docRef.id;
};

export const obterPresencasPorData = async (
  data: Date
): Promise<RegistroPresenca[]> => {
  // Criar range de data (início e fim do dia)
  const inicioDia = new Date(data);
  inicioDia.setHours(0, 0, 0, 0);

  const fimDia = new Date(data);
  fimDia.setHours(23, 59, 59, 999);

  const q = query(
    presencasCollection,
    where("data", ">=", Timestamp.fromDate(inicioDia)),
    where("data", "<=", Timestamp.fromDate(fimDia))
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
        data: doc.data().data.toDate(),
        registradoEm: doc.data().registradoEm.toDate(),
      } as RegistroPresenca)
  );
};

export const obterPresencaPorHorario = async (
  horarioAulaId: string,
  data: Date
): Promise<RegistroPresenca | null> => {
  // Criar range de data (início e fim do dia)
  const inicioDia = new Date(data);
  inicioDia.setHours(0, 0, 0, 0);

  const fimDia = new Date(data);
  fimDia.setHours(23, 59, 59, 999);

  const q = query(
    presencasCollection,
    where("horarioAulaId", "==", horarioAulaId),
    where("data", ">=", Timestamp.fromDate(inicioDia)),
    where("data", "<=", Timestamp.fromDate(fimDia))
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
    data: doc.data().data.toDate(),
    registradoEm: doc.data().registradoEm.toDate(),
  } as RegistroPresenca;
};

export const atualizarPresenca = async (
  id: string,
  status: StatusPresenca,
  observacoes?: string
): Promise<void> => {
  const docRef = doc(presencasCollection, id);
  await updateDoc(docRef, {
    status,
    observacoes,
    registradoEm: Timestamp.fromDate(new Date()),
  });
};

export const deletarPresenca = async (id: string): Promise<void> => {
  const docRef = doc(presencasCollection, id);
  await deleteDoc(docRef);
};
