import React from "react";
import LessonsManager from "./lesson/LessonsManager";
import ProfessorsManager from "./user/UsersManager";
import CadastroHorarios from "./horarios/CadastroHorarios";

type Props = {};

export default function Management({}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <LessonsManager />
      <ProfessorsManager />
      <CadastroHorarios />
    </div>
  );
}
