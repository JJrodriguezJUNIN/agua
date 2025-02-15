
import { Button } from "@/components/ui/button";
import { Share } from "lucide-react";
import { Person } from "@/types/water";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface WhatsappReminderProps {
  people: Person[];
  currentMonth: string;
  amount: number;
}

export const WhatsappReminder = ({ people, currentMonth, amount }: WhatsappReminderProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(`Recordatorio de pago de agua - ${currentMonth}
    
Monto a pagar: $${amount}

Link a la aplicación: ${window.location.href}`);

  const getUnpaidUsers = () => {
    return people.filter(person => !person.hasPaid);
  };

  const handleWhatsappShare = async () => {
    const unpaidUsers = getUnpaidUsers().filter(person => selectedUsers.includes(person.id));
    if (unpaidUsers.length === 0) return;

    setIsLoading(true);
    try {
      const messages = unpaidUsers.map(user => ({
        numero: user.phoneNumber,
        mensaje: message
      }));

      const { data, error } = await supabase.functions.invoke('whatsapp', {
        body: { messages, operation: "send_messages" }
      });

      if (error) throw error;

      if (data.status === "0") {
        toast.success("Mensajes enviados correctamente");
        setShowDialog(false);
      } else {
        toast.error("Error al enviar los mensajes");
      }
    } catch (error) {
      console.error("Error sending WhatsApp messages:", error);
      toast.error("Error al enviar los mensajes de WhatsApp");
    } finally {
      setIsLoading(false);
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
              </div>
            </div>

            <Button 
              onClick={handleWhatsappShare}
              disabled={isLoading || selectedUsers.length === 0 || !unpaidUsers.some(user => 
                selectedUsers.includes(user.id) && user.phoneNumber
              )}
            >
              {isLoading ? "Enviando..." : "Enviar recordatorio"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
