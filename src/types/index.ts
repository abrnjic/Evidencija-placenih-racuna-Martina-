export type Category = 'Struja' | 'Voda' | 'Plin' | 'Smeće' | 'Pričuva' | 'Internet/TV' | 'Mobitel' | 'Ostalo';

export interface Bill {
  id?: string;
  category: Category;
  amount: number;
  datePaid: string; // ISO date string
  note?: string;
  createdAt?: number; // timestamp
}
