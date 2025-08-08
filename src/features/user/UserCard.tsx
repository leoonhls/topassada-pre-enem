import React, { useCallback, useEffect, useState } from "react";
import { User } from "./User";
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
import { Edit, Eye, EyeIcon } from "lucide-react";
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
import { TableCell, TableRow } from "@/components/ui/table";
import { IoEye, IoEyedrop, IoEyeOff, IoEyeSharp } from "react-icons/io5";

type UserCardProps = {
  user: User;
};

export default function UserCard({ user }: UserCardProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);

  return (
    <TableRow>
      <TableCell className="font-medium">{user.name}</TableCell>
      <TableCell>{user.nivel}</TableCell>
      <TableCell>{user.phone}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell className="text-right">
        <Button variant={"secondary"} size={"sm"}>
          <Eye size={15} />
        </Button>
      </TableCell>
    </TableRow>
  );
}
