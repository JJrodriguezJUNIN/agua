import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, DollarSign, Droplet } from "lucide-react";
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
      <CardContent className="py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <span className="font-medium">Mes actual: {currentMonth}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-gray-500" />
              <span className="font-medium">${totalAmount}</span>
            </div>
            <div className="flex items-center gap-2">
              <Droplet className="h-5 w-5 text-gray-500" />
              <span className="font-medium">{bottleCount} bidones</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-medium ${isMonthActive ? 'text-green-600' : 'text-red-600'}`}>
                {isMonthActive ? 'Activo' : 'Cerrado'}
              </span>
            </div>
          </div>
          {isAdmin && isMonthActive && (
            <Button 
              onClick={onStartNewMonth}
              variant="outline"
              className="ml-auto"
            >
              Iniciar Nuevo Mes
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};