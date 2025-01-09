import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface WaterHeaderProps {
  onAddUser: () => void;
}

export const WaterHeader = ({ onAddUser }: WaterHeaderProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Pago de Agua Region Sanitaria III</span>
          <Button variant="outline" onClick={onAddUser}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Usuario
          </Button>
        </CardTitle>
      </CardHeader>
    </Card>
  );
};