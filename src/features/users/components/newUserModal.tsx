import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MdAdd } from "react-icons/md";
import { Button } from "../../../components/ui/button";
import { NewUserForm } from "./newUserForm";

interface NewUserModalProps {
  onSubmitSuccess?: () => void;
}

export default function NewUserModal({ onSubmitSuccess }: NewUserModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">
          {" "}
          <MdAdd />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Usuário</DialogTitle>
          <DialogDescription>
            <NewUserForm />
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
