export type Paycheck = {
  id: string;
  user_id: string;
  amount: number;
  date_received: string;
  notes?: string | null;
  created_at?: string;
};