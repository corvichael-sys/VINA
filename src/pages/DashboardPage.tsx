import { AddDebtForm } from "@/components/debts/AddDebtForm";
import { DebtList } from "@/components/debts/DebtList";
import { DebtSeverityChart } from "@/components/debts/DebtSeverityChart";
import { DebtSummary } from "@/components/debts/DebtSummary";
import { useSession } from "@/context/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { Debt } from "@/types/debt";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Wallet, PieChart, ListChecks, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Placeholder types for other data
interface Paycheck { id: string; amount: number; }
interface Budget { id: string; planned_amount: number; }
interface Transaction { id: string; amount: number; }
interface PaymentPlan { id: string; }

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const fetchDebts = async (userId: string | undefined): Promise<Debt[]> => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("debts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Debt[];
};

const fetchPaychecks = async (userId: string | undefined): Promise<Paycheck[]> => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("paychecks")
    .select("*")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  return data as Paycheck[];
};

const fetchBudgets = async (userId: string | undefined): Promise<Budget[]> => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  return data as Budget[];
};

const fetchTransactions = async (userId: string | undefined): Promise<Transaction[]> => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  return data as Transaction[];
};

const fetchPaymentPlans = async (userId: string | undefined): Promise<PaymentPlan[]> => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("payment_plans")
    .select("*")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  return data as PaymentPlan[];
};

const DashboardPage = () => {
  const { user } = useSession();

  const { data: debts, isLoading: isLoadingDebts, isError: isErrorDebts } = useQuery({
    queryKey: ["debts", user?.id],
    queryFn: () => fetchDebts(user?.id),
    enabled: !!user,
  });

  const { data: paychecks, isLoading: isLoadingPaychecks } = useQuery({
    queryKey: ["paychecks", user?.id],
    queryFn: () => fetchPaychecks(user?.id),
    enabled: !!user,
  });

  const { data: budgets, isLoading: isLoadingBudgets } = useQuery({
    queryKey: ["budgets", user?.id],
    queryFn: () => fetchBudgets(user?.id),
    enabled: !!user,
  });

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: () => fetchTransactions(user?.id),
    enabled: !!user,
  });

  const { data: paymentPlans, isLoading: isLoadingPaymentPlans } = useQuery({
    queryKey: ["paymentPlans", user?.id],
    queryFn: () => fetchPaymentPlans(user?.id),
    enabled: !!user,
  });

  const totalPaychecks = paychecks?.reduce((acc, p) => acc + p.amount, 0) || 0;
  const totalBudgeted = budgets?.reduce((acc, b) => acc + b.planned_amount, 0) || 0;
  const totalTransactions = transactions?.reduce((acc, t) => acc + t.amount, 0) || 0;
  const numPaymentPlans = paymentPlans?.length || 0;

  const isLoadingOverall = isLoadingDebts || isLoadingPaychecks || isLoadingBudgets || isLoadingTransactions || isLoadingPaymentPlans;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold md:text-2xl">Financial Dashboard</h1>
        <AddDebtForm /> {/* Keeping this here for quick access, can be moved later */}
      </div>
      
      <DebtSummary debts={debts} isLoading={isLoadingDebts} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {isLoadingOverall ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Paychecks</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalPaychecks)}</div>
                <p className="text-xs text-muted-foreground">Total income received</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Budgeted</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalBudgeted)}</div>
                <p className="text-xs text-muted-foreground">Across all categories</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <ListChecks className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalTransactions)}</div>
                <p className="text-xs text-muted-foreground">Total spent/received</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Payment Plans</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{numPaymentPlans}</div>
                <p className="text-xs text-muted-foreground">Active payment strategies</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <DebtSeverityChart debts={debts} isLoading={isLoadingDebts} />
        </div>
        <div className="lg:col-span-3">
          <DebtList debts={debts} isLoading={isLoadingDebts} isError={isErrorDebts} />
        </div>
      </div>
    </>
  );
};

export default DashboardPage;