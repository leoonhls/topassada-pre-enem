import { DocumentSnapshot, onSnapshot } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { usersCollection } from "../../../firebase/config";
import type { User } from "../User";
import { DataTable } from "../../../components/common/DataTable";
import { UsersColumns } from "./usersColumns";
import { capitalizeWords } from "@/utils/stringUtils";
import { useUsers } from "@/features/users/server/useUsers";

type UsersListProps = {
  selectedUserId?: string | null;
};

export const UsersList = ({ selectedUserId }: UsersListProps) => {
  const [usersList, setUsersList] = useState<User[]>([]);
  const { fetchUsersAsync } = useUsers();

  const fetchData = useCallback(
    async (pageDoc: DocumentSnapshot | null = null) => {
      try {
        const response = await fetchUsersAsync({}, pageDoc);

        // Se estiver carregando primeira página, substitui dados
        // Se for paginação, adiciona aos dados existentes
        setUsersList((prev) =>
          pageDoc ? [...prev, ...response.items] : response.items
        );
      } catch (error) {
        console.error("Erro ao carregar compras:", error);
      } finally {
      }
    },
    []
  );

  useEffect(() => {
    fetchData(null);
  }, []);

  const filteredUsers = selectedUserId
    ? usersList.filter((user) => user.id === selectedUserId)
    : usersList;

  return (
    <div className="mt-4 grid gap-2">
      <DataTable columns={UsersColumns} data={filteredUsers} />
    </div>
  );
};
