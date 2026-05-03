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
      <div className="flex flex-col sm:flex-row flex-wrap p-3 sm:p-5 gap-3 sm:items-center">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground [text-wrap:balance]">
          Gestão de Usuários
        </h2>
        <div className="flex flex-wrap gap-2">
          <NewUser onCompleted={triggerRefresh} />
          <InviteUserByEmail onCompleted={triggerRefresh} />
          <BulkUsersByName onCompleted={triggerRefresh} />
          <BulkUserInvite onCompleted={triggerRefresh} />
        </div>
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
