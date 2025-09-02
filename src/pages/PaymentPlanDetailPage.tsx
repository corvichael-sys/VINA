import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PaymentPlan } from "@/types/paymentPlan";
import { PlanItem } from "@/types/planItem";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlanItemList } from "@/components/payment-plans/PlanItemList";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const fetchPlan = async (planId: string) => {
  const { data, error } = await supabase.from("payment_plans").select("*").eq("id", planId).single();
  if (error) throw error;
  return data as PaymentPlan;
};

const fetchPlanItems = async (planId: string) => {
  const { data, error } = await supabase.from("plan_items").select("*").eq("plan_id", planId);
  if (error) throw error;
  return data as PlanItem[];
};

const PaymentPlanDetailPage = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();

  const { data: plan, isLoading: isPlanLoading, isError: isPlanError } = useQuery({
    queryKey: ["payment_plan", planId],
    queryFn: () => fetchPlan(planId!),
    enabled: !!planId,
  });

  const { data: items, isLoading: areItemsLoading, isError: areItemsError } = useQuery({
    queryKey: ["plan_items", planId],
    queryFn: () => fetchPlanItems(planId!),
    enabled: !!planId,
  });

  if (isPlanLoading || areItemsLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (isPlanError || areItemsError || !plan || !items) {
    return <p className="text-destructive">Failed to load payment plan details.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold md:text-2xl">{plan.name}</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Payment Schedule</CardTitle>
          <CardDescription>Mark payments as they are completed.</CardDescription>
        </CardHeader>
        <CardContent>
          <PlanItemList plan={plan} items={items} />
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentPlanDetailPage;