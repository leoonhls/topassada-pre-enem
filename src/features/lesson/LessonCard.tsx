import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Lesson } from "./Lesson";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

type LessonCardProps = {
  lesson: Lesson;
};

export default function LessonCard({ lesson }: LessonCardProps) {
  return (
    <Card className="text-white" style={{ backgroundColor: lesson.color }}>
      <CardContent className="px-3 py-2 flex gap-5 items-center">
        <div>{lesson.name}</div>
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
