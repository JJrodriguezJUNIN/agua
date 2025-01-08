import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Payment } from "../types/water";
import { ScrollArea } from "@/components/ui/scroll-area";

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
        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
          {payments.length === 0 ? (
            <p className="text-center text-gray-500">No hay pagos registrados</p>
          ) : (
            <div className="space-y-4">
              {payments.map((payment, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div>
                    <p className="font-medium">
                      ${payment.amount}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(payment.date).toLocaleDateString()}
                    </p>
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
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};