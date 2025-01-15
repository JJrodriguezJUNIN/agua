import { useState } from "react";
import { WaterStats } from "@/components/WaterStats";
import { AddUserDialog } from "@/components/AddUserDialog";
import { EditUserDialog } from "@/components/EditUserDialog";
import { PaymentHistory } from "@/components/PaymentHistory";
import { useWaterData } from "@/hooks/useWaterData";
import { Person } from "../types/water";
import { toast } from "sonner";
import { UserList } from "@/components/UserList";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminLogin } from "@/components/AdminLogin";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const {
    config,
    people,
    isLoading,
    updateConfig,
    addPerson,
    updatePerson,
    deletePerson,
    processPayment
  } = useWaterData();

  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [showPaymentHistoryDialog, setShowPaymentHistoryDialog] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Person | null>(null);
  const { isAdmin, signOut } = useAuth();

  const calculatePersonAmount = () => {
    return people?.length > 0
      ? (config?.bottlePrice * config?.bottleCount) / people.length
      : 0;
  };

  const handlePayment = async (personId: string, file: File | null) => {
    try {
      await processPayment(personId, file);
    } catch (error) {
      toast.error('Error al procesar el pago');
      console.error(error);
    }
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <AdminLogin
        showLoginDialog={showLoginDialog}
        setShowLoginDialog={setShowLoginDialog}
        onLoginSuccess={() => {}}
      />

      {isAdmin && (
        <>
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
        </>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pago de Agua Region Sanitaria III</h1>
        <div className="flex gap-2">
          {isAdmin ? (
            <>
              <Button variant="outline" onClick={() => setShowAddUserDialog(true)}>
                Agregar Usuario
              </Button>
              <Button variant="outline" onClick={() => signOut()}>
                Cerrar Sesión
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setShowLoginDialog(true)}>
              Administrador
            </Button>
          )}
        </div>
      </div>

      {isAdmin && (
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
      )}

      <UserList
        people={people || []}
        onFileUpload={() => {}}
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
        isAdmin={isAdmin}
      />
    </div>
  );
};

export default Index;