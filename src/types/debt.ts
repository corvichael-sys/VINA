export type Debt = {
  id: string;
  user_id: string;
  name: string;
  creditor?: string | null;
  original_amount: number;
  current_balance: number;
  severity?: 'Low' | 'Medium' | 'High' | null;
  due_date?: string | null;
  status: 'active' | 'paid';
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};