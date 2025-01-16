import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface MonthTransitionProps {
  isAdmin: boolean;
  currentMonth: string;
  isMonthActive: boolean;
  totalAmount: number;
  bottleCount: number;
  onStartNewMonth: () => void;
}

export const MonthTransition = ({
  isAdmin,
  currentMonth,
  isMonthActive,
  totalAmount,
  bottleCount,
  onStartNewMonth,
}: MonthTransitionProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Resumen del Mes: {currentMonth}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-gray-500">Estado del Mes</p>
            <p className={`font-medium ${isMonthActive ? 'text-green-600' : 'text-red-600'}`}>
              {isMonthActive ? 'Activo' : 'Cerrado'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total a Pagar</p>
            <p className="font-medium">${totalAmount}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Bidones Consumidos</p>
            <p className="font-medium">{bottleCount}</p>
          </div>
        </div>
        {isAdmin && isMonthActive && (
          <Button 
            onClick={onStartNewMonth}
            className="mt-4"
            variant="outline"
          >
            Iniciar Nuevo Mes
          </Button>
        )}
      </CardContent>
    </Card>
  );
};