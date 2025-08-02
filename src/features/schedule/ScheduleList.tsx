import { memo, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useSchedules } from "./useSchedules";
import { Schedule } from "./Schedule";
import { AulaCard } from "../horarios/AulaCard";

export const SchedulesList = memo(() => {
  // Hooks para gerenciar filtros e paginação

  // Estados para dados e carregamento
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [collSize, setCollSize] = useState("");

  const { fetchScheduleAsync } = useSchedules();

  // Handler para remoção de item
  const handleRemove = useCallback((id: string) => {
    setSchedules((prev) => prev.filter((schedule) => schedule.id !== id));
  }, []);

  // Função para carregar os dados
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchScheduleAsync();

      setCollSize(response.collSize.toString());
      setSchedules(response.items);
    } catch (error) {
      console.error(error);
      toast.warning("Erro ao carregar schedulees");
    } finally {
      setLoading(false);
    }
  }, []);

  // Carrega dados iniciais ou quando filtros mudam
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <div
        className={`mt-4 space-y-4 transition-opacity duration-200 ${
          loading ? "opacity-50" : "opacity-100"
        }`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-5">
          {Object.entries(DIAS_SEMANA).map(([dia, nomeDia]) => (
            <div
              key={dia}
              className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-blue-500 text-center py-2 font-bold">
                {nomeDia}
              </div>

              <div className="flex flex-col gap-3 p-4">
                {quadroHorario[dia]?.length > 0 ? (
                  quadroHorario[dia].map((aula) => (
                    <AulaCard
                      key={aula.id}
                      aula={aula}
                      onMarcarPresenca={marcarPresenca}
                    />
                  ))
                ) : (
                  <p className="flex items-center justify-center w-full">
                    Nenhuma aula agendada
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Indicador de Carregamento */}
      {loading && (
        <div className="mt-4 text-center text-gray-400">Carregando...</div>
      )}
    </div>
  );
});
