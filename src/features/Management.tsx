import React from "react";
import LessonsManager from "./subject/SubjectsManager";
import ProfessorsManager from "./user/UsersManager";

type Props = {};

export default function Management({}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <LessonsManager />
      <ProfessorsManager />
    </div>
  );
}
