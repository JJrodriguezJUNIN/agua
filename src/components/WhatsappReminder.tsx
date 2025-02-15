
import { Button } from "@/components/ui/button";
import { Share, Upload } from "lucide-react";
import { Person } from "@/types/water";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface WhatsappReminderProps {
  people: Person[];
  currentMonth: string;
  amount: number;
}

export const WhatsappReminder = ({ people, currentMonth, amount }: WhatsappReminderProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [message, setMessage] = useState(`Recordatorio de pago de agua - ${currentMonth}
    
Monto a pagar: $${amount}

Link a la aplicación: ${window.location.href}`);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [base64Image, setBase64Image] = useState<string>("");

  const getUnpaidUsers = () => {
    return people.filter(person => !person.hasPaid);
  };

  const convertBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the data:image/*;base64, prefix
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
        }
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error("La imagen no debe superar los 2MB");
        return;
      }
      setSelectedFile(file);
      try {
        const base64 = await convertBase64(file);
        setBase64Image(base64);
      } catch (error) {
        console.error("Error converting file to base64:", error);
        toast.error("Error al procesar la imagen");
      }
    }
  };

  const handleWhatsappShare = async () => {
    const unpaidUsers = getUnpaidUsers().filter(person => selectedUsers.includes(person.id));
    if (unpaidUsers.length === 0) return;

    const selectedUser = unpaidUsers[0]; // Tomamos el primer usuario para el mensaje inicial
    if (!selectedUser.phoneNumber) {
      toast.error("El usuario seleccionado no tiene número de teléfono");
      return;
    }

    // Enviamos el mensaje de texto
    const textMessage = encodeURIComponent(message);
    const textUrl = `https://wa.me/${selectedUser.phoneNumber}?text=${textMessage}`;
    window.open(textUrl, '_blank');

    // Si hay una imagen, la enviamos en un segundo mensaje
    if (base64Image) {
      // Aquí podrías implementar la lógica para enviar la imagen usando una API
      toast.info("La funcionalidad de envío de imágenes requiere una API de WhatsApp Business");
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSelectAll = () => {
    const unpaidUsers = getUnpaidUsers();
    if (selectedUsers.length === unpaidUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(unpaidUsers.map(user => user.id));
    }
  };

  const unpaidUsers = getUnpaidUsers();

  return (
    <>
      <Button
        onClick={() => setShowDialog(true)}
        variant="outline"
        className="flex items-center gap-2"
        disabled={unpaidUsers.length === 0}
      >
        <Share className="h-4 w-4" />
        Recordatorio WhatsApp
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Enviar recordatorio por WhatsApp</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Checkbox 
                id="selectAll"
                checked={selectedUsers.length === unpaidUsers.length}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="selectAll">Seleccionar todos</Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                <div className="flex flex-col gap-2">
                  {unpaidUsers.map(person => (
                    <div key={person.id} className="flex items-center gap-2">
                      <Checkbox
                        id={person.id}
                        checked={selectedUsers.includes(person.id)}
                        onCheckedChange={() => handleSelectUser(person.id)}
                      />
                      <Label htmlFor={person.id} className="flex-1">
                        <div className="flex justify-between items-center">
                          <span>{person.name}</span>
                          <span className="text-sm text-gray-500">
                            {person.phoneNumber || "Sin teléfono"}
                          </span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex flex-col gap-2">
                <Label htmlFor="message">Mensaje</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="h-[200px] resize-none"
                  placeholder="Escribe tu mensaje aquí..."
                />
                <div className="flex flex-col gap-2">
                  <Label htmlFor="image">Imagen adjunta (opcional, máx 2MB)</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  {selectedFile && (
                    <div className="text-sm text-green-600">
                      Imagen seleccionada: {selectedFile.name}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button 
              onClick={handleWhatsappShare}
              disabled={selectedUsers.length === 0 || !unpaidUsers.some(user => 
                selectedUsers.includes(user.id) && user.phoneNumber
              )}
            >
              Enviar recordatorio
              {selectedFile && <Upload className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
