import { memo, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { capitalizeFirstLetter } from "@/utils/stringUtils";
import { fetchSchedulesByDay } from "./fetchSchedulesByDay";
import { Day } from "@/types/Day";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { BadgeCheckIcon } from "lucide-react";
import { horarios } from "./horarios";
import EditDaySchedule from "./EditDay";

export const SchedulesList = memo(() => {
  const [schedulesByDay, setSchedulesByDay] = useState<Day[]>();
  const [loading, setLoading] = useState(true);

  const days = ["segunda", "terça", "quarta", "quinta", "sexta"];

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await fetchSchedulesByDay();

        setSchedulesByDay(data);
      } catch (e) {
        toast.warning("Erro ao carregar horários");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div>
      <div
        className={`mt-4 space-y-4 transition-opacity duration-200 flex flex-wrap gap-5 ${loading ? "opacity-50" : "opacity-100"}`}>
        {days.map((day, idx) => {
          const dayObj = schedulesByDay?.find((d) => d.day === day);
          return (
            <div key={day} className="mb-6 border px-5 py-3 rounded ">
              <div className="flex justify-between">
                <h3 className="text-lg font-bold capitalize mb-2">
                  {capitalizeFirstLetter(day)}-Feira
                </h3>
                {dayObj && (
                  <EditDaySchedule
                    day={dayObj}
                    onSave={(updatedDay) => {
                      setSchedulesByDay((prev) =>
                        prev?.map((d) =>
                          d.day === updatedDay.day ? updatedDay : d,
                        ),
                      );
                    }}
                  />
                )}
              </div>
              <div className="flex flex-col gap-2">
                {dayObj?.lessons?.length ? (
                  dayObj.lessons.map((schedule, i) => (
                    <Item key={i} variant="outline" size={"sm"}>
                      <ItemMedia className="flex flex-col items-center justify-center gap-0">
                        <span>{horarios[i].at(0)}</span>
                        <span>{horarios[i].at(1)}</span>
                      </ItemMedia>

                      <ItemContent>
                        <ItemTitle>{schedule.materia}</ItemTitle>
                        <ItemDescription>
                          {schedule.professor
                            ? schedule.professor.split(" ").length > 1
                              ? `${schedule.professor.split(" ")[0]} ${schedule.professor.split(" ").slice(-1)[0]}`
                              : schedule.professor
                            : ""}
                        </ItemDescription>
                      </ItemContent>
                    </Item>
                  ))
                ) : (
                  <span className="text-gray-400">Nenhum horário</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {loading && (
        <div className="mt-4 text-center text-gray-400">Carregando...</div>
      )}
    </div>
  );
});
