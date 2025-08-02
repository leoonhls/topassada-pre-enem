import React from "react";
import LessonsManager from "./lesson/LessonsManager";
import ProfessorsManager from "./professor/professorsManager";

type Props = {};

export default function Management({}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <LessonsManager />
      <ProfessorsManager />
    </div>
  );
}
