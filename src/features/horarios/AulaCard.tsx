import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "lucide-react";
import { AulaComDetalhes, STATUS_PRESENCA, StatusPresenca } from "./horarios";
import { Button } from "@/components/ui/button";

interface AulaCardProps {
  aula: AulaComDetalhes;
  onMarcarPresenca: (aula: AulaComDetalhes, status: StatusPresenca) => void;
}

export const AulaCard: React.FC<AulaCardProps> = ({
  aula,
  onMarcarPresenca,
}) => {
  return (
    <Card>
      <CardHeader className="flex justify-between gap-5">
        <div className="font-bold text-sm truncate">
          {aula.horaInicio} - {aula.horaFim}
        </div>
        <Badge>{aula.materia.nome}</Badge>
      </CardHeader>

      <CardContent>
        <div>Prof. {aula.professor.nome}</div>
        {aula.sala && <div>Sala: {aula.sala}</div>}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              Marcar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(Object.keys(STATUS_PRESENCA) as StatusPresenca[]).map(
              (status) => (
                <DropdownMenuItem
                  onClick={() => {
                    onMarcarPresenca(aula, status);
                  }}>
                  {STATUS_PRESENCA[status]}
                </DropdownMenuItem>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>

      {aula.presenca?.observacoes && <div>{aula.presenca.observacoes}</div>}
    </Card>
  );
};
