
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
  const [avatar, setAvatar] = useState("https://icons.getbootstrap.com/assets/icons/person-circle.svg");
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

    onAddUser({
      name,
      avatar,
      hasPaid: false,
      paymentHistory: [],
    });

    setName("");
    setAvatar("https://icons.getbootstrap.com/assets/icons/person-circle.svg");
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
            placeholder="URL del avatar (opcional)"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleAddUser}>Agregar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
