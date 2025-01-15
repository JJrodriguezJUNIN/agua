import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Payment } from "../types/water";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PaymentHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payments: Payment[];
  userName: string;
}

export const PaymentHistory = ({
  open,
  onOpenChange,
  payments,
  userName,
}: PaymentHistoryProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Historial de Pagos - {userName}</DialogTitle>
        </DialogHeader>
        <div className="mb-4 p-4 bg-yellow-50 rounded-md">
          <p className="text-sm text-yellow-800">
            💡 Guía: Este historial muestra todos los pagos realizados mensualmente.
            Cada registro incluye el monto pagado, la fecha, el mes correspondiente
            y la cantidad de bidones utilizados.
          </p>
        </div>
        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
          {payments.length === 0 ? (
            <p className="text-center text-gray-500">No hay pagos registrados</p>
          ) : (
            <div className="space-y-4">
              {payments.map((payment, index) => (
                <div
                  key={index}
                  className="flex flex-col border-b pb-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        ${payment.amount}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(payment.date), "d 'de' MMMM 'de' yyyy", { locale: es })}
                      </p>
                      <p className="text-sm text-blue-600">
                        Mes: {payment.month}
                      </p>
                      {payment.bottleCount && (
                        <p className="text-sm text-gray-600">
                          Bidones utilizados: {payment.bottleCount}
                        </p>
                      )}
                    </div>
                    {payment.receipt && (
                      <a
                        href={payment.receipt}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        Ver comprobante
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};