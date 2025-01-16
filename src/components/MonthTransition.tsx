import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, Droplet } from "lucide-react";

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
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          Resumen del Mes: {currentMonth}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Estado del Mes
            </p>
            <p className={`font-medium ${isMonthActive ? 'text-green-600' : 'text-red-600'}`}>
              {isMonthActive ? 'Activo' : 'Cerrado'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total a Pagar
            </p>
            <p className="font-medium">${totalAmount}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Droplet className="h-4 w-4" />
              Bidones Consumidos
            </p>
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