import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/context/SessionContext";
import { Transaction } from "@/types/transaction";
import { Skeleton } from "@/components/ui/skeleton";
import { AddTransactionForm } from "@/components/transactions/AddTransactionForm";
import { TransactionList } from "@/components/transactions/TransactionList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const fetchTransactions = async (userId: string | undefined): Promise<Transaction[]> => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Transaction[];
};

const TransactionsPage = () => {
  const { user } = useSession();
  const { data: transactions, isLoading, isError } = useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: () => fetchTransactions(user?.id),
    enabled: !!user,
  });

  const renderContent = () => {
    if (isLoading) {
      return <Skeleton className="h-64 w-full" />;
    }

    if (isError) {
      return <p className="text-destructive">Failed to load transactions.</p>;
    }

    if (!transactions || transactions.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold">No Transactions Yet</h3>
              <p className="text-muted-foreground">Click "Add Transaction" to get started.</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return <TransactionList transactions={transactions} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Transactions</h1>
        <AddTransactionForm />
      </div>
      {renderContent()}
    </div>
  );
};

export default TransactionsPage;