import { memo, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { DaySchedule } from "./DaySchedule";
import DayScheduleCard from "./DayScheduleCard";
import { useSchedules } from "./useSchedule";
import { days } from "./Days";
import { Timestamp } from "firebase/firestore";

export const SchedulesList = memo(() => {
  const [schedules, setSchedules] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(true);

  const { fetchScheduleAsync } = useSchedules();

  // Função para obter o dia atual da semana
  const getCurrentDay = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = domingo, 1 = segunda, etc.

    const dayMap = {
      1: "segunda",
      2: "terça",
      3: "quarta",
      4: "quinta",
      5: "sexta",
    };

    return dayMap[dayOfWeek as keyof typeof dayMap] || null;
  };

  // Função para ordenar schedules pelos dias da semana
  const sortSchedulesByWeekdays = (schedules: DaySchedule[]) => {
    return schedules.sort((a, b) => {
      const indexA = days.indexOf(a.id as any);
      const indexB = days.indexOf(b.id as any);
      return indexA - indexB;
    });
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchScheduleAsync();
      const sortedSchedules = sortSchedulesByWeekdays(response.items);
      setSchedules(sortedSchedules);
    } catch (error) {
      console.error(error);
      toast.warning("Erro ao carregar schedulees");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  // Encontra o schedule do dia atual
  const currentDay = getCurrentDay();
  const currentDaySchedule = schedules.find(
    (schedule) => schedule.id === currentDay
  );

  return (
    <div className="m-5">
      {/* Horário do dia atual */}
      {currentDaySchedule && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Horário de Hoje</h2>
          <DayScheduleCard
            key={currentDaySchedule.id}
            daySchedule={currentDaySchedule}
            onUpdate={fetchData}
            enableMark
          />
        </div>
      )}

      {/* Lista completa de horários */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-4">Todos os Horários</h2>
      </div>

      <div
        className={`mt-4 space-y-4 transition-opacity duration-200 ${
          loading ? "opacity-50" : "opacity-100"
        }`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 m-5">
          {schedules.map((schedule) => (
            <DayScheduleCard
              key={schedule.id}
              daySchedule={schedule}
              onUpdate={fetchData}
            />
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
