import { Button } from "@/components/ui/button";
import { useState } from "react";
import QuadroHorarios from "../horarios/QuadroHorarios";
import { Input } from "@/components/ui/input";
import { Timestamp } from "firebase/firestore";

function ScheduleManager() {
  const [dataHorario, setDataHorario] = useState(Timestamp.now());

  return (
    <div className="min-h-screen flex flex-col">
      <QuadroHorarios data={dataHorario.toDate()} />
    </div>
  );
}

export default ScheduleManager;
