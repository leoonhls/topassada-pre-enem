import { useAuth } from "@/contexts/AuthContext";
import { LogsList } from "@/features/logs/components/LogList";
import { InstallmentsList } from "@/features/transactions/installments/components/InstallmentsList";

function Dashboard() {
  const { user, userData } = useAuth();

  return (
    <div className="flex flex-col gap-3">
      {(!user || !userData || userData.adm) && (
        <div className="flex flex-col gap-3">
          <InstallmentsList
            type={0}
            pagination={false}
            pagas={false}
            title="Próximas 5 a Pagar"
          />
          <InstallmentsList
            type={1}
            pagination={false}
            pagas={false}
            title="Próximas 5 a Receber"
          />
        </div>
      )}
      {/* <CommissionsList 
        pagination={true}
        pagas={false}
        title="Comissões a pagar"
        icon={
          <MdOutlineAttachMoney size="28" className="mr-2 text-emerald-400" />
        }
      />

      <CommissionsList
        pagination={true}
        pagas={true}
        title="Comissões pagas"
        icon={
          <MdOutlineAttachMoney size="28" className="mr-2 text-emerald-400" />
        }
      /> */}
      <LogsList />
    </div>
  );
}

export default Dashboard;
