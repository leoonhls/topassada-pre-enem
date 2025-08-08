import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React from "react";
import { SubjectsList } from "./SubjectsList";
import { NewSubject } from "./NewSubject";

const SubjectsManager: React.FC = () => {
  return (
    <div className="p-3">
      <div className="flex p-5 gap-3 items-center mb-3">
        <h2 className="text-2xl font-bold text-gray-800 items-center">
          Gestão de Matérias
        </h2>
        <NewSubject />
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold mb-2 text-gray-800">
            Matérias Cadastradas
          </h3>{" "}
        </CardHeader>
        <CardContent>
          <SubjectsList />
        </CardContent>
      </Card>
    </div>
  );
};

export default SubjectsManager;
