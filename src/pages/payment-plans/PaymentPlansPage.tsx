import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PaymentPlan } from "@/types/paymentPlan";
import { PlanItem } from "@/types/planItem";
import { PaymentPlanCard } from "@/components/payment-plans/PaymentPlanCard";
import { CreatePaymentPlanDialog } from "@/components/payment-plans/CreatePaymentPlanDialog";
import { Skeleton } from "@/components/ui/skeleton";

const fetchPaymentPlans = async () => {
  const { data: plans, error: plansError } = await supabase
    .from("payment_plans")
    .select("*")
    .order("created_at", { ascending: false });

  if (plansError) throw new Error(plansError.message);

  if (!plans || plans.length === 0) {
    return { plans: [], items: [] };
  }

  const planIds = plans.map((p: PaymentPlan) => p.id);
  const { data: items, error: itemsError } = await supabase
    .from("plan_items")
    .select("*")
    .in("plan_id", planIds);

  if (itemsError) throw new Error(itemsError.message);

  return { plans, items: items || [] };
};

const PaymentPlansPage = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery<{ plans: PaymentPlan[], items: PlanItem[] }>({
    queryKey: ["payment_plans"],
    queryFn: fetchPaymentPlans,
  });

  const handleDeletionSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["payment_plans"] });
  };

  if (error) {
    return <div className="text-red-500">Error loading payment plans: {error.message}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Payment Plans</h1>
        <CreatePaymentPlanDialog onSuccess={handleDeletionSuccess} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : data && data.plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.plans.map((plan) => {
            const planItems = data.items.filter(item => item.plan_id === plan.id);
            return <PaymentPlanCard key={plan.id} plan={plan} items={planItems} onSuccess={handleDeletionSuccess} />;
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">No Payment Plans Found</h2>
          <p className="text-muted-foreground mt-2">Get started by creating a new payment plan.</p>
        </div>
      )}
    </div>
  );
};

export default PaymentPlansPage;