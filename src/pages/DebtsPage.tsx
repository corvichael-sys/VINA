import { AddDebtForm } from "@/components/debts/AddDebtForm";
import { DebtList } from "@/components/debts/DebtList";
import { DebtSeverityChart } from "@/components/debts/DebtSeverityChart";
import { DebtSummary } from "@/components/debts/DebtSummary";
import { useSession } from "@/context/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { Debt } from "@/types/debt";
import { useQuery } from "@tanstack/react-query";

const fetchDebts = async (userId: string | undefined): Promise<Debt[]> => {
  if (!userId) return [];

  const { data, error } = await supabase
    .from("debts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Debt[];
};

const DebtsPage = () => {
  const { user } = useSession();
  const { data: debts, isLoading, isError } = useQuery({
    queryKey: ["debts", user?.id],
    queryFn: () => fetchDebts(user?.id),
    enabled: !!user,
  });

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold md:text-2xl">Debts Dashboard</h1>
        <AddDebtForm />
      </div>
      
      <DebtSummary debts={debts} isLoading={isLoading} />

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <DebtSeverityChart debts={debts} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-3">
          <DebtList debts={debts} isLoading={isLoading} isError={isError} />
        </div>
      </div>
    </>
  );
};

export default DebtsPage;