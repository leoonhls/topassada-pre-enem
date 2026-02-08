import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Day } from "@/types/Day";
import { capitalizeFirstLetter } from "@/utils/stringUtils";
import { Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import EditFullSchedule from "./EditFullSchedule";
import { fetchSchedulesByDay } from "./fetchSchedulesByDay";
import { horarios } from "./horarios";
import { isAdm } from "@/utils/utils";
import { Button } from "@/components/ui/button";

function ScheduleManager() {
  const [schedulesByDay, setSchedulesByDay] = useState<Day[]>();
  const [loading, setLoading] = useState(true);

  const days = ["segunda", "terça", "quarta", "quinta", "sexta"];

  const isAdmin = isAdm();

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
    <div className="flex flex-col px-3 md:px-5">
      <div className="flex flex-col gap-4 pt-4 px-2 md:px-4">
        <div>
          <div className="flex gap-3 sm:gap-5 items-start sm:items-center">
            <h1 className="flex  text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent">
              Quadro de Horários
            </h1>
            {schedulesByDay && isAdmin && (
              <EditFullSchedule
                days={schedulesByDay}
                onSave={(updatedDays) => setSchedulesByDay(updatedDays)}
              />
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            Visualize todas as aulas da semana
          </p>
        </div>
      </div>

      <div
        className={`mt-4 space-y-4 transition-opacity duration-200 flex flex-wrap gap-4 md:gap-5 justify-center md:justify-start ${loading ? "opacity-50" : "opacity-100"}`}>
        {days.map((day, idx) => {
          const dayObj = schedulesByDay?.find((d) => d.day === day);
          return (
            <div
              key={day}
              className="mb-4 md:mb-6 border px-3 py-2 md:px-5 md:py-3 rounded w-full md:w-auto">
              <div className="flex justify-between items-center">
                <h3 className="text-base md:text-lg font-bold capitalize mb-2">
                  {capitalizeFirstLetter(day)}-Feira
                </h3>
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
                  <span className="text-muted-foreground">Nenhum horário</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {loading && (
        <div className="mt-4 text-center text-muted-foreground">
          Carregando...
        </div>
      )}
    </div>
  );
}

export default ScheduleManager;
