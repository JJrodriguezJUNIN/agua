import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Person } from "../types/water";
import { AdminLogin } from "@/components/AdminLogin";
import { WaterStats } from "@/components/WaterStats";
import { UserCard } from "@/components/UserCard";
import { AddUserDialog } from "@/components/AddUserDialog";
import { EditUserDialog } from "@/components/EditUserDialog";
import { PaymentHistory } from "@/components/PaymentHistory";
import { useWaterData } from "@/hooks/useWaterData";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Index = () => {
  const {
    config,
    people,
    isLoading,
    updateConfig,
    addPerson,
    updatePerson,
    deletePerson,
    uploadFile
  } = useWaterData();

  const { isAdmin, user } = useAuth();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
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
    if (!user) {
      toast.error("Debes iniciar sesión para realizar esta acción");
      return;
    }

    const amount = calculatePersonAmount();
    const currentMonth = getCurrentMonth();
    const person = people?.find(p => p.id === personId);
    
    if (person) {
      const payment = {
        date: new Date().toISOString(),
        amount,
        receipt: person.receipt,
        month: currentMonth
      };

      try {
        await updatePerson({
          id: personId,
          updates: {
            hasPaid: true,
            lastPaymentMonth: currentMonth,
            pendingAmount: undefined,
            paymentHistory: [...(person.paymentHistory || []), payment],
          }
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
    if (!user) {
      toast.error("Debes iniciar sesión para realizar esta acción");
      return;
    }

    const file = e.target.files?.[0];
    if (file) {
      try {
        const receiptUrl = await uploadFile(file);
        if (receiptUrl) {
          await updatePerson({
            id: personId,
            updates: { receipt: receiptUrl }
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

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Iniciar Sesión</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminLogin
              showLoginDialog={true}
              setShowLoginDialog={() => {}}
              onLoginSuccess={() => {}}
            />
          </CardContent>
        </Card>
      </div>
    );
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

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Pago de Agua Region Sanitaria III</span>
            <div className="flex gap-2">
              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={() => setShowAddUserDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Usuario
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {config && (
            <WaterStats
              data={config}
              isAdmin={isAdmin}
              updateBottlePrice={(price) => updateConfig({ bottlePrice: price })}
              updateBottleCount={(count) => updateConfig({ bottleCount: count })}
              calculatePersonAmount={calculatePersonAmount}
            />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {people?.map((person) => (
          <UserCard
            key={person.id}
            person={person}
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
            isAdmin={isAdmin}
          />
        ))}
      </div>
    </div>
  );
};

export default Index;