import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React, { useState } from "react";
import { BulkUsersByName } from "./BulkUsersByName";
import { BulkUserInvite } from "./BulkUserInvite";
import { InviteUserByEmail } from "./InviteUserByEmail";
import { NewUser } from "./NewUser";
import { UsersList } from "./UsersList";

const UsersManager: React.FC = () => {
  const [refreshSignal, setRefreshSignal] = useState(0);
  const triggerRefresh = () => setRefreshSignal((prev) => prev + 1);

  return (
    <div className="p-3">
      <div className="flex p-5  gap-3 items-center">
        <h2 className="text-2xl font-bold text-foreground items-center">
          Gestão de Usuários
        </h2>
        <NewUser onCompleted={triggerRefresh} />
        <InviteUserByEmail onCompleted={triggerRefresh} />
        <BulkUsersByName onCompleted={triggerRefresh} />
        <BulkUserInvite onCompleted={triggerRefresh} />
      </div>

      {/* Lista de Useres */}
      <Card>
        <CardHeader>
          <h3 className="px-3">Usuários Cadastrados</h3>
        </CardHeader>
        <CardContent>
          <UsersList refreshSignal={refreshSignal} />
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersManager;
