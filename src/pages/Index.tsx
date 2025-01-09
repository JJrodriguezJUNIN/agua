import { useState } from "react";
import { WaterStats } from "@/components/WaterStats";
import { AddUserDialog } from "@/components/AddUserDialog";
import { EditUserDialog } from "@/components/EditUserDialog";
import { PaymentHistory } from "@/components/PaymentHistory";
import { useWaterData } from "@/hooks/useWaterData";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Person } from "../types/water";
import { toast } from "sonner";
import { WaterHeader } from "@/components/WaterHeader";
import { UserList } from "@/components/UserList";
import { CardContent } from "@/components/ui/card";

const Index = () => {
  const {
    config,
    people,
    isLoading,
    updateConfig,
    addPerson,
    updatePerson,
    deletePerson,
    uploadFile,
  } = useWaterData();

  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [showPaymentHistoryDialog, setShowPaymentHistoryDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Person | null>(null);

  const calculatePersonAmount = () => {
    return people?.length > 0
      ? (config?.bottlePrice * config?.bottleCount) / people.length
      : 0;
  };

  const getCurrentMonth = () => {
    return format(new Date(), "MMMM yyyy", { locale: es });
  };

  const handlePayment = async (personId: string) => {
    const amount = calculatePersonAmount();
    const currentMonth = getCurrentMonth();
    const person = people?.find((p) => p.id === personId);

    if (person) {
      const payment = {
        date: new Date().toISOString(),
        amount,
        receipt: person.receipt,
        month: currentMonth,
      };

      try {
        await updatePerson({
          id: personId,
          updates: {
            hasPaid: true,
            lastPaymentMonth: currentMonth,
            pendingAmount: undefined,
            paymentHistory: [...(person.paymentHistory || []), payment],
          },
        });
      } catch (error) {
        toast.error("Error al procesar el pago");
        console.error(error);
      }
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    personId: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const receiptUrl = await uploadFile(file);
        if (receiptUrl) {
          await updatePerson({
            id: personId,
            updates: { receipt: receiptUrl },
          });
        }
      } catch (error) {
        toast.error("Error al subir el archivo");
        console.error(error);
      }
    }
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <AddUserDialog
        open={showAddUserDialog}
        onOpenChange={setShowAddUserDialog}
        onAddUser={addPerson}
      />

      {selectedUser && (
        <>
          <EditUserDialog
            open={showEditUserDialog}
            onOpenChange={setShowEditUserDialog}
            onEditUser={(user) => updatePerson({ id: user.id, updates: user })}
            user={selectedUser}
          />
          <PaymentHistory
            open={showPaymentHistoryDialog}
            onOpenChange={setShowPaymentHistoryDialog}
            payments={selectedUser.paymentHistory || []}
            userName={selectedUser.name}
          />
        </>
      )}

      <WaterHeader onAddUser={() => setShowAddUserDialog(true)} />

      <div className="mb-6">
        <CardContent>
          {config && (
            <WaterStats
              data={config}
              isAdmin={true}
              updateBottlePrice={(price) => updateConfig({ bottlePrice: price })}
              updateBottleCount={(count) => updateConfig({ bottleCount: count })}
              calculatePersonAmount={calculatePersonAmount}
            />
          )}
        </CardContent>
      </div>

      <UserList
        people={people || []}
        onFileUpload={handleFileUpload}
        onPayment={handlePayment}
        onEdit={(user) => {
          setSelectedUser(user);
          setShowEditUserDialog(true);
        }}
        onDelete={deletePerson}
        onShowHistory={(user) => {
          setSelectedUser(user);
          setShowPaymentHistoryDialog(true);
        }}
        amount={calculatePersonAmount()}
      />
    </div>
  );
};

export default Index;