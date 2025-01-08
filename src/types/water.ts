export interface Payment {
  date: string;
  amount: number;
  receipt?: string;
}

export interface Person {
  id: string;
  name: string;
  avatar: string;
  hasPaid: boolean;
  receipt?: string;
  paymentHistory: Payment[];
}

export interface WaterConfig {
  bottlePrice: number;
  bottleCount: number;
  people: Person[];
}