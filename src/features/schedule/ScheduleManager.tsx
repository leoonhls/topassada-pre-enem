import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Timestamp } from "firebase/firestore";
import { SchedulesList } from "./ScheduleList";

function ScheduleManager() {
  const [dataHorario, setDataHorario] = useState(Timestamp.now());

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-4 pt-4 pl-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent">
            Quadro de Horários
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Visualize todas as aulas da semana
          </p>
        </div>
      </div>
      <SchedulesList />
    </div>
  );
}

export default ScheduleManager;
