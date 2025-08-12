import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Timestamp } from "firebase/firestore";
import { SchedulesList } from "./ScheduleList";

function ScheduleManager() {
  const [dataHorario, setDataHorario] = useState(Timestamp.now());

  return (
    <div className="flex flex-col">
      <SchedulesList />
    </div>
  );
}

export default ScheduleManager;
