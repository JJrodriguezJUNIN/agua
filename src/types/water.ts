export interface Payment {
  date: string;
  amount: number;
  receipt?: string;
  month: string;
}

export interface Person {
  id: string;
  name: string;
  avatar: string;
  hasPaid: boolean;
  receipt?: string;
  paymentHistory: Payment[];
  Dispenser?: string;
  lastPaymentMonth?: string;
  pendingAmount?: number;
}

export interface WaterConfig {
  bottlePrice: number;
  bottleCount: number;
  people: Person[];
}