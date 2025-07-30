import { Button } from "@/components/ui/button";
import { useState } from "react";
import "../App.css";
import QuadroHorarios from "./horarios/QuadroHorarios";

function ScheduleManager() {
  const [dataHorario, setDataHorario] = useState(new Date());

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-white border-b border-gray-200 px-5">
        <div className="max-w-5xl flex items-center gap-4 py-4">
          <label className="font-bold text-sm">📅 Data:</label>
          <input
            type="date"
            value={dataHorario.toISOString().split("T")[0]}
            onChange={(e) => setDataHorario(new Date(e.target.value))}
            className="p-2 border border-gray-300 rounded text-sm"
          />
          <Button
            onClick={() => setDataHorario(new Date())}
            className="px-3 py-2 bg-green-500 text-white rounded text-xs font-semibold hover:bg-green-600 transition-colors">
            Hoje
          </Button>
          <span className="text-gray-600 text-sm">
            {dataHorario.toLocaleDateString("pt-BR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
      <QuadroHorarios data={dataHorario} />
    </div>
  );
}

export default ScheduleManager;
