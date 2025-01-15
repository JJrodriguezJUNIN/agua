import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Person } from "../types/water";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { DialogDescription } from "./ui/dialog";

interface AllPaymentsHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  people: Person[];
  isAdmin: boolean;
  onUpdateReceipt: (personId: string, paymentMonth: string, newReceipt: File) => void;
  onDeletePayment?: (personId: string, paymentMonth: string) => void;
  onCashPayment?: (personId: string, amount: number) => void;
}

export const AllPaymentsHistory = ({
  open,
  onOpenChange,
  people,
  isAdmin,
  onUpdateReceipt,
  onDeletePayment,
  onCashPayment,
}: AllPaymentsHistoryProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingPayment, setEditingPayment] = useState<{
    personId: string;
    month: string;
  } | null>(null);
  const [showCashPaymentDialog, setShowCashPaymentDialog] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [cashAmount, setCashAmount] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleUpdateReceipt = () => {
    if (selectedFile && editingPayment) {
      onUpdateReceipt(editingPayment.personId, editingPayment.month, selectedFile);
      setSelectedFile(null);
      setEditingPayment(null);
    }
  };

  const handleCashPayment = () => {
    if (selectedPerson && onCashPayment && cashAmount) {
      onCashPayment(selectedPerson.id, Number(cashAmount));
      setShowCashPaymentDialog(false);
      setCashAmount("");
      setSelectedPerson(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Historial de Pagos {isAdmin ? "- Todos los Usuarios" : ""}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[500px] w-full rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Mes</TableHead>
                  <TableHead>Bidones</TableHead>
                  <TableHead>Comprobante</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {people.map((person) =>
                  person.paymentHistory.map((payment, index) => (
                    <TableRow key={`${person.id}-${index}`}>
                      <TableCell>{person.name}</TableCell>
                      <TableCell>
                        {format(new Date(payment.date), "d 'de' MMMM 'de' yyyy", {
                          locale: es,
                        })}
                      </TableCell>
                      <TableCell>${payment.amount}</TableCell>
                      <TableCell>{payment.month}</TableCell>
                      <TableCell>{payment.bottleCount || "N/A"}</TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {(isAdmin || person.id === person.id) && (
                            <>
                              {editingPayment?.personId === person.id &&
                              editingPayment?.month === payment.month ? (
                                <>
                                  <Input
                                    type="file"
                                    onChange={handleFileChange}
                                    accept="image/*,.pdf"
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={handleUpdateReceipt}
                                      disabled={!selectedFile}
                                    >
                                      Guardar
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setEditingPayment(null)}
                                    >
                                      Cancelar
                                    </Button>
                                  </div>
                                </>
                              ) : (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      setEditingPayment({
                                        personId: person.id,
                                        month: payment.month,
                                      })
                                    }
                                  >
                                    Modificar comprobante
                                  </Button>
                                  {isAdmin && onDeletePayment && (
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                        >
                                          Eliminar pago
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Esta acción eliminará el pago y marcará el mes como pendiente para el usuario.
                                            Esta acción no se puede deshacer.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => onDeletePayment(person.id, payment.month)}
                                          >
                                            Eliminar
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
          {isAdmin && (
            <div className="mt-4">
              <Button onClick={() => setShowCashPaymentDialog(true)}>
                Registrar Pago en Efectivo
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showCashPaymentDialog} onOpenChange={setShowCashPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pago en Efectivo</DialogTitle>
            <DialogDescription>
              Seleccione un usuario y ingrese el monto pagado en efectivo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Usuario</label>
              <select
                className="w-full p-2 border rounded"
                onChange={(e) => {
                  const person = people.find(p => p.id === e.target.value);
                  setSelectedPerson(person || null);
                }}
                value={selectedPerson?.id || ""}
              >
                <option value="">Seleccione un usuario</option>
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Monto</label>
              <Input
                type="number"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                placeholder="Ingrese el monto"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCashPaymentDialog(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleCashPayment}
                disabled={!selectedPerson || !cashAmount}
              >
                Registrar Pago
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};