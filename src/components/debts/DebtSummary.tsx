import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Debt } from "@/types/debt";
import { DollarSign, Hash, Receipt, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DebtSummaryProps {
  debts: Debt[] | undefined;
  isLoading: boolean;
  totalDebt: number;
  debtChangePercentage: number;
  fundsLeftOver: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const DebtSummary = ({ debts, isLoading, totalDebt, debtChangePercentage, fundsLeftOver }: DebtSummaryProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  const activeDebts = (debts || []).filter(d => d.status === 'active').length;

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Debt</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalDebt)}</div>
          {isFinite(debtChangePercentage) && debtChangePercentage !== 0 && (
            <p className={cn(
              "text-xs text-muted-foreground flex items-center",
              debtChangePercentage > 0 ? "text-red-500" : "text-green-500"
            )}>
              {debtChangePercentage > 0 ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
              {Math.abs(debtChangePercentage).toFixed(1)}% this month
            </p>
          )}
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
          <CardTitle className="text-sm font-medium">Funds Left Over</CardTitle>
          <Receipt className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(fundsLeftOver)}</div>
          <p className="text-xs text-muted-foreground">After debt payments this month</p>
        </CardContent>
      </Card>
    </div>
  );
};