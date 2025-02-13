
import { Person, WaterConfig } from './water';

export interface PaymentOptions {
  personId: string;
  file?: File | null;
  amount?: number;
  selectedMonth?: string;
}

export interface PaymentRecord {
  date: string;
  amount: number;
  month: string;
  bottleCount?: number;
  receipt?: string;
  isAdminEdited?: boolean;
  [key: string]: string | number | boolean | undefined;
}

export interface PaymentUpdateParams {
  person: Person;
  config: WaterConfig;
  currentMonth: string;
}
