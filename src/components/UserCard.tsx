import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Pencil, Trash2, History, Eye } from "lucide-react";
import { Person } from "../types/water";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

interface UserCardProps {
  person: Person;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, id: string) => void;
  onPayment: (id: string, file: File | null) => void;
  onEdit: (person: Person) => void;
  onDelete: (id: string) => void;
  onShowHistory: (person: Person) => void;
  amount: number;
  isAdmin: boolean;
}

export const UserCard = ({
  person,
  onFileUpload,
  onPayment,
  onEdit,
  onDelete,
  onShowHistory,
  amount,
  isAdmin,
}: UserCardProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const hasPendingPayment = !person.hasPaid && person.pendingAmount;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handlePayment = () => {
    if (selectedFile) {
      onPayment(person.id, selectedFile);
      setSelectedFile(null);
    }
  };

  return (
    <Card
      className={cn(
        hasPendingPayment ? "bg-red-50" : "",
        "transition-colors duration-200"
      )}
    >
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
            {person.lastPaymentMonth && (
              <span className="text-sm text-gray-600">
                Último pago: {person.lastPaymentMonth}
              </span>
            )}
            {person.pendingAmount && !person.hasPaid && (
              <span className="text-sm text-red-600">
                Monto pendiente: ${person.pendingAmount}
              </span>
            )}
            {!person.hasPaid && (
              <>
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*,.pdf"
                  />
                </div>
                {person.receipt && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver comprobante
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <img
                        src={person.receipt}
                        alt="Comprobante"
                        className="w-full h-auto"
                      />
                    </DialogContent>
                  </Dialog>
                )}
                <Button
                  onClick={handlePayment}
                  disabled={!selectedFile}
                >
                  Pagar ${amount}
                </Button>
              </>
            )}
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onShowHistory(person)}
              >
                <History className="h-4 w-4" />
              </Button>
              {isAdmin && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(person)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onDelete(person.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};