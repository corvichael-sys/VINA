export type Transaction = {
  id: string;
  user_id: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  memo?: string | null;
  linked_debt_id?: string | null;
  plan_item_id?: string | null;
  created_at?: string;
};