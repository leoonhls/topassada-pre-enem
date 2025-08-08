import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React from "react";
import { NewUser } from "./NewUser";
import { UsersList } from "./UsersList";

const UsersManager: React.FC = () => {
  return (
    <div className="p-3">
      <div className="flex p-5  gap-3 items-center">
        <h2 className="text-2xl font-bold text-gray-800 items-center">
          Gestão de Usuários
        </h2>
        <NewUser />
      </div>

      {/* Lista de Useres */}
      <Card>
        <CardHeader>
          <h3 className="px-3">Usuários Cadastrados</h3>
        </CardHeader>
        <CardContent>
          <UsersList />
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersManager;
