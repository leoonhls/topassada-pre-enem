import { useState } from "react";
import "../App.css";
import QuadroHorarios from "./listapresenca";
import CadastroMaterias from "./materias/CadastroMaterias";
import CadastroProfessores from "./professores/CadastroProfessores";
import CadastroHorarios from "./horarios/CadastroHorarios";

type TabType = "quadro" | "materias" | "professores" | "horarios";

function ScheduleManager() {
  const [tabAtiva, setTabAtiva] = useState<TabType>("quadro");
  const [dataHorario, setDataHorario] = useState(new Date());

  const tabs = [
    { id: "quadro" as TabType, label: "📅 Quadro de Horários", icon: "📅" },
    { id: "materias" as TabType, label: "📚 Matérias", icon: "📚" },
    { id: "professores" as TabType, label: "👨‍🏫 Professores", icon: "👨‍🏫" },
    { id: "horarios" as TabType, label: "⏰ Horários", icon: "⏰" },
  ];

  const renderizarConteudo = () => {
    switch (tabAtiva) {
      case "quadro":
        return <QuadroHorarios data={dataHorario} />;
      case "materias":
        return <CadastroMaterias />;
      case "professores":
        return <CadastroProfessores />;
      case "horarios":
        return <CadastroHorarios />;
      default:
        return <QuadroHorarios data={dataHorario} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white p-5 shadow">
        <div className="max-w-5xl">
          <h1 className="text-2xl font-bold mb-2">
            Sistema de Horários - Pré-ENEM
          </h1>
          <p className="opacity-90">
            Gestão de professores, matérias e controle de presença
          </p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200 px-5">
        <div className="max-w-5xl mx-auto flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTabAtiva(tab.id)}
              className={`px-5 py-4 text-sm font-medium transition-colors border-b-4 focus:outline-none ${
                tabAtiva === tab.id
                  ? "border-blue-700 text-blue-700 bg-blue-50 font-bold"
                  : "border-transparent text-gray-600 hover:bg-gray-100"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Date Selector para o Quadro de Horários */}
      {tabAtiva === "quadro" && (
        <div className="bg-white border-b border-gray-200 px-5">
          <div className="max-w-5xl mx-auto flex items-center gap-4 py-4">
            <label className="font-bold text-sm">📅 Data:</label>
            <input
              type="date"
              value={dataHorario.toISOString().split("T")[0]}
              onChange={(e) => setDataHorario(new Date(e.target.value))}
              className="p-2 border border-gray-300 rounded text-sm"
            />
            <button
              onClick={() => setDataHorario(new Date())}
              className="px-3 py-2 bg-green-500 text-white rounded text-xs font-semibold hover:bg-green-600 transition-colors">
              Hoje
            </button>
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
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full">
        {renderizarConteudo()}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-5 mt-10">
        <p className="text-sm m-0">
          Sistema de Gestão de Horários - Pré-ENEM © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}

export default ScheduleManager;
