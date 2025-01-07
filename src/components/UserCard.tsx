import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { Person } from "../types/water";
import { Card, CardContent } from "@/components/ui/card";

interface UserCardProps {
  person: Person;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, id: string) => void;
  onPayment: (id: string) => void;
  amount: number;
}

export const UserCard = ({
  person,
  onFileUpload,
  onPayment,
  amount,
}: UserCardProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={person.avatar} alt={person.name} />
            <AvatarFallback>{person.name[0]}</AvatarFallback>
          </Avatar>
          <h3 className="text-lg font-semibold">{person.name}</h3>
          <div className="flex flex-col items-center gap-2">
            <span className={person.hasPaid ? "text-green-500" : "text-red-500"}>
              {person.hasPaid ? "Pagado" : "Pendiente"}
            </span>
            {!person.hasPaid && (
              <>
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  <Input
                    type="file"
                    onChange={(e) => onFileUpload(e, person.id)}
                    accept="image/*,.pdf"
                  />
                </div>
                <Button
                  onClick={() => onPayment(person.id)}
                  disabled={!person.receipt}
                >
                  Pagar ${amount}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};