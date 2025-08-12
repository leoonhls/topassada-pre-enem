import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { capitalizeFirstLetter } from "@/utils/stringUtils";
import { CheckCircle } from "lucide-react";
import { useState } from "react";
import { DaySchedule, TimeSlot } from "./DaySchedule";

type Props = {
  timeSlot: TimeSlot;
  onSave?: (updatedScheduleDay: DaySchedule) => void;
};

export default function MarkPresenceDialog({ timeSlot, onSave }: Props) {
  const handleSave = () => {};

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={"ghost"} size={"sm"}>
          <CheckCircle />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {capitalizeFirstLetter(timeSlot.subjectId)}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Edição de matérias e professores.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
            
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSave}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
