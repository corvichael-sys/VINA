export type Budget = {
  id: string;
  user_id: string;
  month: string; // YYYY-MM format
  category: string;
  planned_amount: number;
  created_at?: string;
};