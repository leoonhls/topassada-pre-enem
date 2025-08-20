import { memo, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { DaySchedule } from "./DaySchedule";
import DayScheduleCard from "./DayScheduleCard";
import { fetchSchedulesFromSubcollections } from "./fetchSchedulesFromSubcollections";
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
  // Função para filtrar o timeSlot válido para a data
  const getValidSlot = (slotArray: any) => {
    if (!Array.isArray(slotArray)) return slotArray;
    const validSlots = slotArray.filter((slot) => {
      if (!slot.validFrom) return false;
      const validFrom = slot.validFrom.toDate
        ? slot.validFrom.toDate()
        : new Date(slot.validFrom);
      const isAfterValidFrom = selectedDate >= validFrom;
      if (!slot.validUntil) return isAfterValidFrom;
      const validUntil = slot.validUntil.toDate
        ? slot.validUntil.toDate()
        : new Date(slot.validUntil);
      const isBeforeValidUntil = selectedDate < validUntil;
      return isAfterValidFrom && isBeforeValidUntil;
    });
    return validSlots.length > 0
      ? validSlots[validSlots.length - 1]
      : slotArray[slotArray.length - 1];
  };

  let currentDayScheduleRaw = schedules.find(
    (schedule) => schedule.id === selectedDay
  );

  let currentDaySchedule = currentDayScheduleRaw
    ? {
        ...currentDayScheduleRaw,
        timeSlots: {
          firstPeriod: getValidSlot(
            currentDayScheduleRaw.timeSlots.firstPeriod
          ),
          secondPeriod: getValidSlot(
            currentDayScheduleRaw.timeSlots.secondPeriod
          ),
          break: currentDayScheduleRaw.timeSlots.break,
          thirdPeriod: getValidSlot(
            currentDayScheduleRaw.timeSlots.thirdPeriod
          ),
          fourthPeriod: getValidSlot(
            currentDayScheduleRaw.timeSlots.fourthPeriod
          ),
        },
      }
    : null;

  // Remove o hook antigo, usaremos a função de subcoleções

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
      const schedules = await fetchSchedulesFromSubcollections(selectedDate);
      const sortedSchedules = sortSchedulesByWeekdays(schedules);
      setSchedules(sortedSchedules);
    } catch (error) {
      console.error(error);
      toast.warning("Erro ao carregar horários");
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
          {schedules.length === 0 && (
            <div className="text-center text-gray-400 col-span-4">
              Nenhum horário encontrado para esta data.
            </div>
          )}
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
