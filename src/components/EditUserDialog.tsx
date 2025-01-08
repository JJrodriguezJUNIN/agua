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

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditUser: (user: Person) => void;
  user: Person;
}

export const EditUserDialog = ({
  open,
  onOpenChange,
  onEditUser,
  user,
}: EditUserDialogProps) => {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar);
  const { toast } = useToast();

  const handleEditUser = () => {
    if (!name || !avatar) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos",
        variant: "destructive",
      });
      return;
    }

    onEditUser({
      ...user,
      name,
      avatar,
    });

    onOpenChange(false);
    
    toast({
      title: "Usuario editado",
      description: "El usuario ha sido editado exitosamente.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Nombre del usuario"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="URL del avatar"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleEditUser}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};