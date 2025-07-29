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
import { doc } from "firebase/firestore";
import { IoClose } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { usersCollection } from "@/firebase/config";
import { Button } from "@/components/ui/button";
import { updateDocWithLog } from "@/firebase/firestoreWithLog";
import { User } from "../User";

interface UserFormProps {
  user: User;
}

export const DesactiveUserModal = (user: UserFormProps) => {
  const deleteUser = async (userId: string) => {
    try {
      const userRef = doc(usersCollection, userId);

      await updateDocWithLog(
        userRef,
        { active: false },
        `Usuário deletado: ${userId}`
      );
      alert("Usuário desativado com sucesso!");
      console.log("Documento excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir documento:", error);
    }
  };
  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="font-semibold text-red-600 hover:text-red-400 hover:bg-red-100 gap-2">
            <MdDelete className="text-red-000 hover:text-red-600" />
            Desativar Usuário
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500">
              Tem certeza?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita, o Usuário será permanentemente
              desativado do seu sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteUser(user.user.id)}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
