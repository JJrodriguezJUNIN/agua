
import { Button } from "@/components/ui/button";
import { Share } from "lucide-react";
import { Person } from "@/types/water";

interface WhatsappReminderProps {
  people: Person[];
  currentMonth: string;
  amount: number;
}

export const WhatsappReminder = ({ people, currentMonth, amount }: WhatsappReminderProps) => {
  const getUnpaidUsers = () => {
    return people.filter(person => !person.hasPaid);
  };

  const handleWhatsappShare = () => {
    const unpaidUsers = getUnpaidUsers();
    if (unpaidUsers.length === 0) {
      return;
    }

    const names = unpaidUsers.map(person => person.name).join(", ");
    const message = `Recordatorio de pago de agua - ${currentMonth}
    
Usuarios pendientes de pago ($${amount}): ${names}

Link a la aplicación: ${window.location.href}`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  return (
    <Button
      onClick={handleWhatsappShare}
      variant="outline"
      className="flex items-center gap-2"
      disabled={getUnpaidUsers().length === 0}
    >
      <Share className="h-4 w-4" />
      Recordatorio WhatsApp
    </Button>
  );
};
