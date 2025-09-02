import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/context/SessionContext";
import { PaymentPlan } from "@/types/paymentPlan";
import { PlanItem } from "@/types/planItem";
import { Skeleton } from "@/components/ui/skeleton";
import { AddPaymentPlanDialog } from "@/components/payment-plans/AddPaymentPlanDialog";
import { PaymentPlanCard } from "@/components/payment-plans/PaymentPlanCard";

const fetchPlans = async (userId: string) => {
  const { data, error } = await supabase.from("payment_plans").select("*").eq("user_id", userId).eq("strategy", "simple");
  if (error) throw error;
  return data as PaymentPlan[];
};

const fetchAllPlanItems = async (userId: string) => {
  const { data, error } = await supabase.from("plan_items").select("*").eq("user_id", userId);
  if (error) throw error;
  return data as PlanItem[];
};

const PaymentPlansPage = () => {
  const { user } = useSession();
  const queryClient = useQueryClient(); // Initialize useQueryClient

  const { data: plans, isLoading: arePlansLoading, isError: arePlansError } = useQuery({
    queryKey: ["payment_plans", user?.id],
    queryFn: () => fetchPlans(user!.id),
    enabled: !!user,
  });

  const { data: items, isLoading: areItemsLoading, isError: areItemsError } = useQuery({
    queryKey: ["plan_items", user?.id],
    queryFn: () => fetchAllPlanItems(user!.id),
    enabled: !!user,
  });

  // Function to invalidate queries after a successful operation (add/delete)
  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["payment_plans"] });
    queryClient.invalidateQueries({ queryKey: ["plan_items"] });
  };

  const renderContent = () => {
    if (arePlansLoading || areItemsLoading) {
      return <Skeleton className="h-64 w-full" />;
    }

    if (arePlansError || areItemsError) {
      return <p className="text-destructive">Failed to load payment plans.</p>;
    }

    if (!plans || plans.length === 0) {
      return (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <h3 className="text-lg font-semibold">No Payment Plans Yet</h3>
          <p className="text-muted-foreground">Click "Create New Plan" to get started.</p>;
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plans.map(plan => {
          const planItems = items?.filter(item => item.plan_id === plan.id) || [];
          return <PaymentPlanCard key={plan.id} plan={plan} items={planItems} onSuccess={handleSuccess} />;
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Payment Plans</h1>
        <AddPaymentPlanDialog onSuccess={handleSuccess} /> {/* Pass onSuccess to AddPaymentPlanDialog */}
      </div>
      {renderContent()}
    </div>
  );
};

export default PaymentPlansPage;