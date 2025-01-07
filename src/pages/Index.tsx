import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { Droplet, Upload, DollarSign, Users } from "lucide-react";
import initialData from "../data/water.json";
import { WaterConfig, Person } from "../types/water";

const Index = () => {
  const [data, setData] = useState<WaterConfig>(initialData);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  const calculatePersonAmount = () => {
    return (data.bottlePrice * data.bottleCount) / data.people.length;
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
      // En una implementación real, aquí subirías el archivo a un servidor
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

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Sistema de Pago de Agua</span>
            <Button
              variant="outline"
              onClick={() => setIsAdmin(!isAdmin)}
            >
              {isAdmin ? "Modo Usuario" : "Modo Admin"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <Droplet className="h-4 w-4" />
              <span>Bidones: {data.bottleCount}</span>
              {isAdmin && (
                <Input
                  type="number"
                  value={data.bottleCount}
                  onChange={(e) => updateBottleCount(Number(e.target.value))}
                  className="w-24"
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>Precio por bidón: ${data.bottlePrice}</span>
              {isAdmin && (
                <Input
                  type="number"
                  value={data.bottlePrice}
                  onChange={(e) => updateBottlePrice(Number(e.target.value))}
                  className="w-24"
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Monto por persona: ${calculatePersonAmount()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.people.map((person) => (
          <Card key={person.id}>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={person.avatar} alt={person.name} />
                  <AvatarFallback>{person.name[0]}</AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-semibold">{person.name}</h3>
                <div className="flex flex-col items-center gap-2">
                  <span className={person.hasPaid ? "text-green-500" : "text-red-500"}>
                    {person.hasPaid ? "Pagado" : "Pendiente"}
                  </span>
                  {!person.hasPaid && (
                    <>
                      <div className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        <Input
                          type="file"
                          onChange={(e) => handleFileUpload(e, person.id)}
                          accept="image/*,.pdf"
                        />
                      </div>
                      <Button
                        onClick={() => handlePayment(person.id)}
                        disabled={!person.receipt}
                      >
                        Pagar ${calculatePersonAmount()}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Index;