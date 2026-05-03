import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React from "react";
import { NewAluno } from "./NewAluno";
import { AlunosList } from "./AlunosList";

const AlunosManager: React.FC = () => {
  return (
    <div className="p-3 flex flex-col gap-4">
      <div className="flex px-3 md:px-5 gap-3 md:gap-4 items-center justify-between">
        <h2 className="text-xl md:text-2xl font-bold text-foreground min-w-0 truncate [text-wrap:balance]">
          Gestão de Alunos
        </h2>
        <div className="shrink-0">
          <NewAluno />
        </div>
      </div>
      <AlunosList />
    </div>
  );
};

export default AlunosManager;
