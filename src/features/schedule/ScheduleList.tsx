import { memo, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { DaySchedule } from "./DaySchedule";
import DayScheduleCard from "./DayScheduleCard";
import { useSchedules } from "./useSchedule";
import { days, getCurrentDay } from "./Days";
import { Timestamp } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const SchedulesList = memo(() => {
  const today = new Date();
  const [schedules, setSchedules] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(today);

  const selectedDay = getCurrentDay(selectedDate);
  let currentDaySchedule = schedules.find(
    (schedule) => schedule.id === selectedDay
  );

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

  // Encontra o schedule do dia atual

  return (
    <div className="m-5">
      {/* Horário do dia atual */}
      <div className="mb-6 flex flex-col gap-3">
        <div className="flex gap-2">
          <Input
            max={today.toISOString().split("T")[0]}
            className="w-min"
            type="date"
            value={selectedDate.toISOString().split("T")[0]}
            onChange={(e) => {
              if (!e.target.value) return today;
              const [year, month, day] = e.target.value.split("-");
              setSelectedDate(
                new Date(Number(year), Number(month) - 1, Number(day))
              );
            }}
            required
          />
          <Button
            size={"sm"}
            onClick={() => {
              setSelectedDate(today);
            }}>
            Hoje
          </Button>
        </div>
        {currentDaySchedule && (
          <DayScheduleCard
            key={currentDaySchedule.id}
            daySchedule={currentDaySchedule}
            onUpdate={fetchData}
            enableMark
          />
        )}
      </div>

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
