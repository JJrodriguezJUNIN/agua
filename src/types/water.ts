export interface Person {
  id: string;
  name: string;
  avatar: string;
  hasPaid: boolean;
  receipt?: string;
}

export interface WaterConfig {
  bottlePrice: number;
  bottleCount: number;
  people: Person[];
}