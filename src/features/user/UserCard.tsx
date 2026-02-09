import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Eye } from "lucide-react";
import { User } from "./User";
import { getPreferredName } from "@/utils/stringUtils";

type UserCardProps = {
  user: User;
};

export default function UserCard({ user }: UserCardProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">
        {getPreferredName(user.name, (user as any).nome_social)}
      </TableCell>
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
