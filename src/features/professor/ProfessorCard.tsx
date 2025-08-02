import React, { useCallback, useEffect, useState } from "react";
import { Professor } from "./Professor";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lesson } from "../lesson/Lesson";
import { useFirebaseDocumentCache } from "@/hooks/useFirebaseDocumentCache";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cpfMask } from "@/utils/Masks";

type ProfessorCardProps = {
  professor: Professor;
};

export default function ProfessorCard({ professor }: ProfessorCardProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);

  const { getFromCacheOrFetch: getLesson } =
    useFirebaseDocumentCache<Lesson>("lessons");

  const fetchData = useCallback(async () => {
    try {
      const lessonsPromisesMap = new Map();
      professor.subjectsIds.forEach((id) => {
        if (!lessonsPromisesMap.has(id)) {
          lessonsPromisesMap.set(id, getLesson(id));
        }
      });

      const lessonsData = await Promise.all(
        Array.from(lessonsPromisesMap.values()).filter(
          (lesson) => lesson != lesson
        )
      );

      setLessons(lessonsData);
    } catch (error) {
      // handle error if needed
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Card>
      <CardHeader>
        <div className="flex gap-5 justify-between items-center">
          <span>{professor.name}</span>
          <div className="flex gap-5 items-center">
            <span>{professor.phone}</span>
            <span>{professor.email}</span>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>
                    <Eye />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>{cpfMask(professor.cpf)}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Edit />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete
                      your account and remove your data from our servers.
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1">
          {lessons.map((sub) => (
            <Badge title={sub.name}>{sub.name}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
