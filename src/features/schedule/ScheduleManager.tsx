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
        <header className="">
          <div className="max-w-5xl">
            <h1 className="text-2xl font-bold mb-2">Sistema de Horários</h1>
            <p className="opacity-90">
              Quadro de horários e controle de presença.
            </p>
          </div>
        </header>
      </div>
      <SchedulesList />
    </div>
  );
}

export default ScheduleManager;
