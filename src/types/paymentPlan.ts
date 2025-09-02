export type PaymentPlan = {
  id: string;
  user_id: string;
  name: string;
  strategy: string;
  final_due_date: string;
  created_at?: string;
  updated_at?: string;
  total_amount?: number | null;
  number_of_payments?: number | null;
};