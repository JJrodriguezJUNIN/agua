import { UserCard } from "./UserCard";
import { Person } from "../types/water";

interface UserListProps {
  people: Person[];
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, id: string) => void;
  onPayment: (id: string, file: File | null) => void;
  onEdit: (person: Person) => void;
  onDelete: (id: string) => void;
  onShowHistory: (person: Person) => void;
  amount: number;
  isAdmin: boolean;
}

export const UserList = ({
  people,
  onFileUpload,
  onPayment,
  onEdit,
  onDelete,
  onShowHistory,
  amount,
  isAdmin,
}: UserListProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {people?.map((person) => (
        <UserCard
          key={person.id}
          person={person}
          onFileUpload={onFileUpload}
          onPayment={onPayment}
          onEdit={onEdit}
          onDelete={onDelete}
          onShowHistory={onShowHistory}
          amount={amount}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  );
};