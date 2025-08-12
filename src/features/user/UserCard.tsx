import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Eye } from "lucide-react";
import { useState } from "react";
import { Subject } from "../subject/Subject";
import { User } from "./User";

type UserCardProps = {
  user: User;
};

export default function UserCard({ user }: UserCardProps) {
  const [lessons, setLessons] = useState<Subject[]>([]);

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
