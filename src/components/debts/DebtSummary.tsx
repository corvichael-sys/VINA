import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Debt } from "@/types/debt";
import { DollarSign, Hash, Scale } from "lucide-react";

interface DebtSummaryProps {
  debts: Debt[] | undefined;
  isLoading: boolean;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const DebtSummary = ({ debts, isLoading }: DebtSummaryProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (!debts || debts.length === 0) {
    return null; // Don't show summary if there are no debts
  }

  const totalBalance = debts.reduce((acc, debt) => acc + debt.current_balance, 0);
  const activeDebts = debts.filter(d => d.status === 'active').length;
  const averageBalance = debts.length > 0 ? totalBalance / debts.length : 0;

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Debt</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
          <p className="text-xs text-muted-foreground">Across all your debts</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Debts</CardTitle>
          <Hash className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeDebts}</div>
          <p className="text-xs text-muted-foreground">Number of debts not yet paid off</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Balance</CardTitle>
          <Scale className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(averageBalance)}</div>
          <p className="text-xs text-muted-foreground">Average amount per debt</p>
        </CardContent>
      </Card>
    </div>
  );
};