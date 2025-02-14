
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Person } from "../types/water";

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddUser: (user: Omit<Person, "id">) => void;
}

export const AddUserDialog = ({
  open,
  onOpenChange,
  onAddUser,
}: AddUserDialogProps) => {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("person-circle");
  const [phoneNumber, setPhoneNumber] = useState("");
  const { toast } = useToast();

  const handleAddUser = () => {
    if (!name) {
      toast({
        title: "Error",
        description: "Por favor ingrese el nombre del usuario",
        variant: "destructive",
      });
      return;
    }

    const iconName = avatar.trim() || "person-circle";
    const avatarUrl = `https://icons.getbootstrap.com/assets/icons/${iconName}.svg`;

    // Format phone number: remove spaces and add country code if not present
    let formattedPhone = phoneNumber.replace(/\s/g, "");
    if (formattedPhone && !formattedPhone.startsWith("+")) {
      formattedPhone = "+54" + formattedPhone;
    }

    onAddUser({
      name,
      avatar: avatarUrl,
      hasPaid: false,
      paymentHistory: [],
      phoneNumber: formattedPhone || null,
    });

    setName("");
    setAvatar("person-circle");
    setPhoneNumber("");
    onOpenChange(false);
    
    toast({
      title: "Usuario agregado",
      description: "El usuario ha sido agregado exitosamente.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Usuario</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Nombre del usuario"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Ícono de Bootstrap (por defecto: person-circle)"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
          />
          <Input
            placeholder="Número de teléfono (ej: +541112345678)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleAddUser}>Agregar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
