import { AddDebtForm } from "@/components/debts/AddDebtForm";
import { DebtList } from "@/components/debts/DebtList";
import { DebtSeverityChart } from "@/components/debts/DebtSeverityChart";
import { DebtSummary } from "@/components/debts/DebtSummary";
import { useSession } from "@/context/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { Debt } from "@/types/debt";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, PieChart, ListChecks, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { startOfMonth, endOfMonth, format } from "date-fns";

interface Paycheck { id: string; amount: number; }
interface Budget { id: string; planned_amount: number; }
interface Transaction { id: string; amount: number; type: string; category: string; linked_debt_id: string | null; }
interface PaymentPlan { id: string; }

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const fetchAllDebts = async (userId: string | undefined): Promise<Debt[]> => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("debts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Debt[];
};

const fetchNewDebtsThisMonth = async (userId: string | undefined, startDate: Date, endDate: Date): Promise<{ original_amount: number }[]> => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("debts")
    .select("original_amount")
    .eq("user_id", userId)
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString());
  if (error) throw new Error(error.message);
  return data || [];
}

const fetchPaychecksThisMonth = async (userId: string | undefined, startDate: Date, endDate: Date): Promise<Paycheck[]> => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("paychecks")
    .select("id, amount") // Added 'id'
    .eq("user_id", userId)
    .gte("date_received", startDate.toISOString())
    .lte("date_received", endDate.toISOString());
  if (error) throw new Error(error.message);
  return data || [];
}

const fetchBudgetsThisMonth = async (userId: string | undefined, month: string): Promise<Budget[]> => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("budgets")
    .select("id, planned_amount") // Added 'id'
    .eq("user_id", userId)
    .eq("month", month);
  if (error) throw new Error(error.message);
  return data || [];
}

const fetchTransactionsThisMonth = async (userId: string | undefined, startDate: Date, endDate: Date): Promise<Transaction[]> => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("transactions")
    .select("id, amount, type, category, linked_debt_id") // Added 'id' and 'category'
    .eq("user_id", userId)
    .gte("date", startDate.toISOString())
    .lte("date", endDate.toISOString());
  if (error) throw new Error(error.message);
  return data || [];
};

const fetchPaymentPlans = async (userId: string | undefined): Promise<PaymentPlan[]> => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("payment_plans")
    .select("id")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  return data as PaymentPlan[];
};

const DashboardPage = () => {
  const { user } = useSession();
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const currentMonthString = format(now, 'yyyy-MM');

  const { data: debts, isLoading: isLoadingDebts, isError: isErrorDebts } = useQuery({
    queryKey: ["debts", user?.id],
    queryFn: () => fetchAllDebts(user?.id),
    enabled: !!user,
  });

  const { data: newDebts, isLoading: isLoadingNewDebts } = useQuery({
    queryKey: ["newDebts", user?.id, currentMonthString],
    queryFn: () => fetchNewDebtsThisMonth(user?.id, currentMonthStart, currentMonthEnd),
    enabled: !!user,
  });

  const { data: paychecks, isLoading: isLoadingPaychecks } = useQuery({
    queryKey: ["paychecks", user?.id, currentMonthString],
    queryFn: () => fetchPaychecksThisMonth(user?.id, currentMonthStart, currentMonthEnd),
    enabled: !!user,
  });

  const { data: budgets, isLoading: isLoadingBudgets } = useQuery({
    queryKey: ["budgets", user?.id, currentMonthString],
    queryFn: () => fetchBudgetsThisMonth(user?.id, currentMonthString),
    enabled: !!user,
  });

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["transactions", user?.id, currentMonthString],
    queryFn: () => fetchTransactionsThisMonth(user?.id, currentMonthStart, currentMonthEnd),
    enabled: !!user,
  });
  
  const { data: paymentPlans, isLoading: isLoadingPaymentPlans } = useQuery({
    queryKey: ["paymentPlans", user?.id],
    queryFn: () => fetchPaymentPlans(user?.id),
    enabled: !!user,
  });

  const currentTotalDebt = debts?.reduce((acc, debt) => acc + debt.current_balance, 0) || 0;
  const incomeThisMonth = paychecks?.reduce((acc, p) => acc + p.amount, 0) || 0;
  const budgetedThisMonth = budgets?.reduce((acc, b) => acc + b.planned_amount, 0) || 0;
  const numPaymentPlans = paymentPlans?.length || 0;

  const debtPaymentsThisMonth = transactions
    ?.filter(t => t.category === 'Debt Payment')
    .reduce((acc, t) => acc + t.amount, 0) || 0;

  const newDebtValueThisMonth = newDebts?.reduce((acc, d) => acc + d.original_amount, 0) || 0;
  const startOfMonthBalance = currentTotalDebt - newDebtValueThisMonth + debtPaymentsThisMonth;
  
  const debtChangePercentage = startOfMonthBalance > 0 
    ? ((currentTotalDebt - startOfMonthBalance) / startOfMonthBalance) * 100 
    : (currentTotalDebt > 0 ? 100 : 0);

  const fundsLeftOver = incomeThisMonth - debtPaymentsThisMonth;

  const isLoadingOverall = isLoadingDebts || isLoadingNewDebts || isLoadingPaychecks || isLoadingBudgets || isLoadingTransactions || isLoadingPaymentPlans;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold md:text-2xl">Financial Dashboard</h1>
        <AddDebtForm />
      </div>
      
      <DebtSummary 
        debts={debts} 
        isLoading={isLoadingDebts || isLoadingNewDebts || isLoadingTransactions} 
        totalDebt={currentTotalDebt}
        debtChangePercentage={debtChangePercentage}
        fundsLeftOver={fundsLeftOver}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {isLoadingOverall ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Income (This Month)</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(incomeThisMonth)}</div>
                <p className="text-xs text-muted-foreground">Total income received this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Budgeted (This Month)</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(budgetedThisMonth)}</div>
                <p className="text-xs text-muted-foreground">Total amount budgeted this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Debt Payments (Month)</CardTitle>
                <ListChecks className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(debtPaymentsThisMonth)}</div>
                <p className="text-xs text-muted-foreground">Total paid towards debts this month</p>
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