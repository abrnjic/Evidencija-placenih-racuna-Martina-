export type Category = string;

export interface Bill {
  id?: string;
  category: Category;
  amount: number;
  datePaid: string; // ISO date string (when it was added/paid)
  dueDate?: string; // ISO date string for when it must be paid
  isPaid?: boolean;
  reminderPreference?: number; // hours before due date to remind (e.g., 4, 8, 12, 24)
  note?: string;
  iban?: string; // IBAN for payment
  model?: string; // Model (e.g. HR00)
  pozivNaBroj?: string; // Reference number
  createdAt?: number; // timestamp
}
