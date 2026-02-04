import React from "react";
import ProfessorsManager from "./user/UsersManager";

type Props = {};

export default function Management({}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <ProfessorsManager />
    </div>
  );
}
