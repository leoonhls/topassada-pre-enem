import React, { useState } from "react";
import { collection, addDoc, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../firebase/config";

const nomes = [
  "Ana Clara",
  "Beatriz",
  "Bruno",
  "Camila",
  "Carlos",
  "Daniel",
  "Eduarda",
  "Felipe",
  "Gabriel",
  "Giovana",
  "Gustavo",
  "Isabela",
  "João Pedro",
  "Julia",
  "Larissa",
  "Leonardo",
  "Letícia",
  "Lucas",
  "Luiza",
  "Mariana",
  "Matheus",
  "Murilo",
  "Nicole",
  "Pedro",
  "Rafael",
  "Roberta",
  "Samuel",
  "Sara",
  "Thiago",
  "Vinícius",
];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function getDiasArray() {
  const dias: string[] = [];
  const hoje = new Date();
  for (let i = 0; i < 40; i++) {
    const d = new Date(hoje);
    d.setDate(d.getDate() - i);
    dias.push(
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    );
  }
  return dias;
}

export const DevPopulateData: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const popularAlunos = async () => {
    setLoading(true);
    const alunosSnapshot = await getDocs(collection(db, "alunos"));
    if (alunosSnapshot.size === 0) {
      for (let index = 0; index < nomes.length; index++) {
        const nome = nomes[index];
        const emailLocal = nome
          .normalize("NFD")
          .replace(/[^a-zA-Z\s]/g, "")
          .trim()
          .toLowerCase()
          .replace(/\s+/g, ".");

        await addDoc(collection(db, "alunos"), {
          nome,
          nome_social: nome,
          cpf: String(10000000000 + index).padStart(11, "0"),
          email: `${emailLocal || "aluno"}${index + 1}@exemplo.com`,
          phone: "11999990000",
          active: true,
          pfpPath: "",
        });
      }
    }
  };

  const popularChamadas = async () => {
    const alunosSnapshot = await getDocs(collection(db, "alunos"));
    const alunosList: { id: string; nome: string }[] = [];
    alunosSnapshot.forEach((doc) => {
      alunosList.push({ id: doc.id, nome: doc.data().nome });
    });
    const dias = getDiasArray();
    for (const dia of dias) {
      const lista = alunosList.map((aluno) => {
        const presenca = Math.random() > 0.2;
        const justificativa =
          Math.random() > 0.7 ? "Falta justificada" : undefined;
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
        if (justificativa !== undefined) {
          item.justificativa = justificativa;
        }
        return item;
      });
      await addDoc(collection(db, "chamadas"), {
        timestamp: Timestamp.now(),
        dia,
        quemFez: "dev-component",
        lista,
      });
    }
  };

  const handlePopulate = async () => {
    setLoading(true);
    await popularAlunos();
    await popularChamadas();
    setLoading(false);
    setDone(true);
  };

  React.useEffect(() => {
    handlePopulate();
  }, []);

  return (
    <div className="p-4 bg-muted border rounded">
      {loading && <span>Populando dados...</span>}
      {done && <span>Dados populados!</span>}
    </div>
  );
};
