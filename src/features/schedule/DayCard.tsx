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

  return "Card dia";
}
