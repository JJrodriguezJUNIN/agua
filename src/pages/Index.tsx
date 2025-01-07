import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";
import initialData from "../data/water.json";
import { WaterConfig, Person } from "../types/water";
import { AdminLogin } from "@/components/AdminLogin";
import { WaterStats } from "@/components/WaterStats";
import { UserCard } from "@/components/UserCard";
import { AddUserDialog } from "@/components/AddUserDialog";

const Index = () => {
  const [data, setData] = useState<WaterConfig>(initialData);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const { toast } = useToast();

  const calculatePersonAmount = () => {
    return data.people.length > 0
      ? (data.bottlePrice * data.bottleCount) / data.people.length
      : 0;
  };

  const handlePayment = (personId: string) => {
    setData((prev) => ({
      ...prev,
      people: prev.people.map((p) =>
        p.id === personId ? { ...p, hasPaid: true } : p
      ),
    }));
    toast({
      title: "Pago registrado",
      description: "El pago ha sido registrado exitosamente.",
    });
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    personId: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setData((prev) => ({
        ...prev,
        people: prev.people.map((p) =>
          p.id === personId ? { ...p, receipt: URL.createObjectURL(file) } : p
        ),
      }));
      toast({
        title: "Comprobante subido",
        description: "El comprobante se ha subido correctamente.",
      });
    }
  };

  const updateBottlePrice = (price: number) => {
    if (isAdmin) {
      setData((prev) => ({ ...prev, bottlePrice: price }));
    }
  };

  const updateBottleCount = (count: number) => {
    if (isAdmin) {
      setData((prev) => ({ ...prev, bottleCount: count }));
    }
  };

  const handleAddUser = (newUser: Omit<Person, "id">) => {
    if (isAdmin) {
      const id = (data.people.length + 1).toString();
      setData((prev) => ({
        ...prev,
        people: [...prev.people, { ...newUser, id }],
      }));
    }
  };

  return (
    <div className="container mx-auto p-4">
      <AdminLogin
        showLoginDialog={showLoginDialog}
        setShowLoginDialog={setShowLoginDialog}
        onLoginSuccess={() => setIsAdmin(true)}
      />

      <AddUserDialog
        open={showAddUserDialog}
        onOpenChange={setShowAddUserDialog}
        onAddUser={handleAddUser}
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Sistema de Pago de Agua</span>
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
              <Button
                variant="outline"
                onClick={() => {
                  if (!isAdmin) {
                    setShowLoginDialog(true);
                  } else {
                    setIsAdmin(false);
                    toast({
                      title: "Sesión finalizada",
                      description: "Has salido del modo administrador.",
                    });
                  }
                }}
              >
                {isAdmin ? "Modo Usuario" : "Modo Admin"}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WaterStats
            data={data}
            isAdmin={isAdmin}
            updateBottlePrice={updateBottlePrice}
            updateBottleCount={updateBottleCount}
            calculatePersonAmount={calculatePersonAmount}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.people.map((person) => (
          <UserCard
            key={person.id}
            person={person}
            onFileUpload={handleFileUpload}
            onPayment={handlePayment}
            amount={calculatePersonAmount()}
          />
        ))}
      </div>
    </div>
  );
};

export default Index;