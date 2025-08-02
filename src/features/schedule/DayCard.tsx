import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Timestamp } from "firebase/firestore";
import { ScheduleDay } from "./Schedule";
import { useFirebaseDocumentCache } from "@/hooks/useFirebaseDocumentCache";

type Props = {
  date: Timestamp;
};

export default function DayCard({ date }: Props) {
  const { getFromCacheOrFetch: getScheduleDay } =
    useFirebaseDocumentCache<ScheduleDay>("schedules");

  return (
    <Card className={`${aula.presenca ? "border border-green-500" : ""}`}>
      <CardHeader className="flex flex-wrap justify-between gap-x-5 gap-y-2">
        <div className="font-bold text-sm truncate text-nowrap">
          {aula.horaInicio} - {aula.horaFim}
        </div>
        <Badge>{aula.materia.nome}</Badge>
      </CardHeader>

      <CardContent className="flex justify-between items-end gap-6">
        <div>
          <div>Prof. {aula.professor.name}</div>
          {aula.sala && <div>Sala: {aula.sala}</div>}
        </div>
        {!detalhesPresenca ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size={"sm"} variant="outline">
                Marcar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(Object.keys(STATUS_PRESENCA) as StatusPresenca[])
                .filter((status) => status !== "falta_justificada")
                .map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => {
                      onMarcarPresenca(aula, status, "");
                    }}>
                    {STATUS_PRESENCA[status]}
                  </DropdownMenuItem>
                ))}
              <DropdownMenuItem onClick={(e) => e.preventDefault()}>
                <JustificativaModal
                  onSubmit={(obs) =>
                    onMarcarPresenca(
                      aula,
                      "FALTA_JUSTIFICADA" as StatusPresenca,
                      obs
                    )
                  }
                />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Dialog>
            <DialogTrigger asChild>
              <Button size={"sm"} variant="outline">
                Detalhes
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Detalhes</DialogTitle>
                <DialogDescription>
                  Detalhes do horário marcado.
                </DialogDescription>
              </DialogHeader>
              <div>{aula.presenca?.observacoes}</div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
      <div className="flex pb-3 w-full justify-center">
        {aula.presenca?.status ? STATUS_PRESENCA[aula.presenca.status] : null}
      </div>
    </Card>
  );
}
