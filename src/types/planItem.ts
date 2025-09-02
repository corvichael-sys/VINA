export type PlanItem = {
  id: string;
  user_id: string;
  plan_id: string;
  debt_id?: string | null;
  scheduled_date: string;
  amount_planned: number;
  paid: boolean;
  paid_date?: string | null;
  created_at?: string;
};