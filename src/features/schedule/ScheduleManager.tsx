import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Timestamp } from "firebase/firestore";

function ScheduleManager() {
  const [dataHorario, setDataHorario] = useState(Timestamp.now());

  return (
    <div className="flex flex-col">
      <div>Teste</div>
      <div>Teste</div>
      <div>Teste</div>
      <div>Teste</div>
    </div>
  );
}

export default ScheduleManager;
