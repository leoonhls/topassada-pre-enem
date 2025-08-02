import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AulaComDetalhes,
  RegistroPresenca,
  STATUS_PRESENCA,
  StatusPresenca,
} from "./horarios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFirebaseDocumentCache } from "@/hooks/useFirebaseDocumentCache";
import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

interface AulaCardProps {
  aula: AulaComDetalhes;
  onMarcarPresenca: (
    aula: AulaComDetalhes,
    status: StatusPresenca,
    obs: string
  ) => void;
}

export const AulaCard: React.FC<AulaCardProps> = ({
  aula,
  onMarcarPresenca,
}) => {
  const [detalhesPresenca, setDetalhesPresenca] = useState<RegistroPresenca>();

  const { getFromCacheOrFetch: getPresenca } =
    useFirebaseDocumentCache<RegistroPresenca>("presencas");
  const fetchData = useCallback(async () => {
    try {
      const p = await getPresenca(aula.id, "horarioAulaId");
      if (
        p &&
        p.horarioAulaId === horario.id &&
        p.data.getDate() === data.getDate() &&
        p.data.getMonth() === data.getMonth() &&
        p.data.getFullYear() === data.getFullYear()
      )
        setDetalhesPresenca(presencaData!);
    } finally {
    }
  }, [aula, getPresenca]);

  useEffect(() => {
    fetchData();
  }, []);

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
};

interface JustificativaModalProps {
  onSubmit: (obs: string) => void;
}

export const JustificativaModal: React.FC<JustificativaModalProps> = ({
  onSubmit,
}) => {
  const [obs, setObs] = useState("");

  return (
    <Dialog>
      <DialogTrigger>Falta Justificada</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            <Input onChange={(e) => setObs(e.target.value)} />
            <Button onClick={() => onSubmit(obs)}>Enviar</Button>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
