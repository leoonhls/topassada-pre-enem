import { memo, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { DaySchedule } from "./DaySchedule";
import DayScheduleCard from "./DayScheduleCard";
import { useSchedules } from "./useSchedule";
import { days } from "./Days";

export const SchedulesList = memo(() => {
  const [schedules, setSchedules] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(true);

  const { fetchScheduleAsync } = useSchedules();

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

  return (
    <div>
      <div
        className={`mt-4 space-y-4 transition-opacity duration-200 ${
          loading ? "opacity-50" : "opacity-100"
        }`}>
        <div className="grid gap-4 m-5">
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
