import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/context/SessionContext";
import { Budget } from "@/types/budget";
import { Skeleton } from "@/components/ui/skeleton";
import { AddBudgetForm } from "@/components/budgets/AddBudgetForm.tsx";
import { BudgetList } from "@/components/budgets/BudgetList.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const fetchBudgets = async (userId: string | undefined): Promise<Budget[]> => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", userId)
    .order("month", { ascending: false })
    .order("category", { ascending: true });
  if (error) throw new Error(error.message);
  return data as Budget[];
};

const BudgetsPage = () => {
  const { user } = useSession();
  const { data: budgets, isLoading, isError } = useQuery({
    queryKey: ["budgets", user?.id],
    queryFn: () => fetchBudgets(user?.id),
    enabled: !!user,
  });

  const renderContent = () => {
    if (isLoading) {
      return <Skeleton className="h-64 w-full" />;
    }

    if (isError) {
      return <p className="text-destructive">Failed to load budgets.</p>;
    }

    if (!budgets || budgets.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Budget Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold">No Budget Entries Yet</h3>
              <p className="text-muted-foreground">Click "Add Budget" to get started.</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return <BudgetList budgets={budgets} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Budgets</h1>
        <AddBudgetForm />
      </div>
      {renderContent()}
    </div>
  );
};

export default BudgetsPage;