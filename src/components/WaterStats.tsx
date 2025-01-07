import { Input } from "@/components/ui/input";
import { Droplet, DollarSign, Users } from "lucide-react";
import { WaterConfig } from "../types/water";

interface WaterStatsProps {
  data: WaterConfig;
  isAdmin: boolean;
  updateBottlePrice: (price: number) => void;
  updateBottleCount: (count: number) => void;
  calculatePersonAmount: () => number;
}

export const WaterStats = ({
  data,
  isAdmin,
  updateBottlePrice,
  updateBottleCount,
  calculatePersonAmount,
}: WaterStatsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="flex items-center gap-2">
        <Droplet className="h-4 w-4" />
        <span>Bidones: {data.bottleCount}</span>
        {isAdmin && (
          <Input
            type="number"
            value={data.bottleCount}
            onChange={(e) => updateBottleCount(Number(e.target.value))}
            className="w-24"
          />
        )}
      </div>
      <div className="flex items-center gap-2">
        <DollarSign className="h-4 w-4" />
        <span>Precio por bidón: ${data.bottlePrice}</span>
        {isAdmin && (
          <Input
            type="number"
            value={data.bottlePrice}
            onChange={(e) => updateBottlePrice(Number(e.target.value))}
            className="w-24"
          />
        )}
      </div>
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        <span>Monto por persona: ${calculatePersonAmount()}</span>
      </div>
    </div>
  );
};