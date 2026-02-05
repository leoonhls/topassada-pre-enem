import { db } from "@/firebase/config";
import { Materias } from "@/types/Materias";
import { doc, setDoc } from "firebase/firestore";

const days = ["segunda", "terça", "quarta", "quinta", "sexta"];

const fakeProfessores = [
  "Ana Souza",
  "Carlos Silva",
  "Beatriz Lima",
  "João Oliveira",
  "Marina Costa",
  "Pedro Martins",
  "Fernanda Rocha",
  "Lucas Almeida",
  "Juliana Ramos",
  "Ricardo Mendes",
];

function getRandomProfessor() {
  return fakeProfessores[Math.floor(Math.random() * fakeProfessores.length)];
}

export async function popularHorariosSemana() {
  for (const day of days) {
    const lessons = Array(4)
      .fill(null)
      .map((_, i) => ({
        materia: Materias[i % Materias.length],
        professor: getRandomProfessor(),
      }));
    const docRef = doc(db, "schedules", day);
    // Salva as aulas como chaves numéricas (0,1,2,3)
    const data = lessons.reduce(
      (acc, lesson, idx) => {
        acc[idx] = lesson;
        return acc;
      },
      {} as Record<string, { materia: string; professor: string }>,
    );
    await setDoc(docRef, data);
    // Remova o console.log ou adapte conforme necessidade do app
  }
}
