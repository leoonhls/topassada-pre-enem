import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React from "react";
import { NewProfessor } from "./NewProfessor";
import { ProfessorsList } from "./ProfessorList";

const ProfessorsManager: React.FC = () => {
  return (
    <div className="p-3">
      <div className="flex p-5  gap-3 items-center">
        <h2 className="text-2xl font-bold text-gray-800 items-center">
          Gestão de Professores
        </h2>
        <NewProfessor />
      </div>

      {/* Lista de Professores */}
      <Card>
        <CardHeader>
          <h3 className="px-3">Professores Cadastrados</h3>
        </CardHeader>
        <CardContent>
          <ProfessorsList />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfessorsManager;
