import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Subject } from "./Subject";

type SubjectCardProps = {
  subject: Subject;
};

export default function SubjectCard({ subject }: SubjectCardProps) {
  return (
    <Card className="text-white" style={{ backgroundColor: subject.color }}>
      <CardContent className="px-3 py-2 flex gap-5 items-center">
        <div>{subject.name}</div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <MoreHorizontal className="h-6 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Excluir</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}
