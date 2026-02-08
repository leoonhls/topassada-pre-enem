import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React from "react";
import { NewAluno } from "./NewAluno";
import { AlunosList } from "./AlunosList";

const AlunosManager: React.FC = () => {
  return (
    <div className="p-3">
      <div className="flex p-5 gap-3 items-center">
        <h2 className="text-2xl font-bold text-gray-800 items-center">
          Gestão de Alunos
        </h2>
        <NewAluno />
      </div>
      <Card>
        <CardHeader>
          <h3 className="px-3">Alunos Cadastrados</h3>
        </CardHeader>
        <CardContent>
          <AlunosList />
        </CardContent>
      </Card>
    </div>
  );
};

export default AlunosManager;
