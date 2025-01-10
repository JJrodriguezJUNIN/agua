import { Json } from "../integrations/supabase/types";

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
  lastPaymentMonth?: string;
  pendingAmount?: number;
}

export interface WaterConfig {
  id: number;
  bottlePrice: number;
  bottleCount: number;
}

// Supabase interfaces that match the database schema
export interface SupabasePerson {
  id: string;
  name: string;
  avatar: string;
  has_paid: boolean;
  receipt?: string;
  payment_history: Json[];
  last_payment_month?: string;
  pending_amount?: number;
}

export interface SupabaseWaterConfig {
  id: number;
  bottle_price: number;
  bottle_count: number;
}