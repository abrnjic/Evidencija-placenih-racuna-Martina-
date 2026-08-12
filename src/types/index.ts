export type Category = string;

export interface Bill {
  id?: string;
  category: Category;
  amount: number;
  datePaid: string; // ISO date string
  note?: string;
  createdAt?: number; // timestamp
}
