import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/context/SessionContext";
import { Paycheck } from "@/types/paycheck";
import { Skeleton } from "@/components/ui/skeleton";
import { AddPaycheckForm } from "@/components/paychecks/AddPaycheckForm.tsx";
import { PaycheckList } from "@/components/paychecks/PaycheckList.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const fetchPaychecks = async (userId: string | undefined): Promise<Paycheck[]> => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("paychecks")
    .select("*")
    .eq("user_id", userId)
    .order("date_received", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Paycheck[];
};

const PaychecksPage = () => {
  const { user } = useSession();
  const { data: paychecks, isLoading, isError } = useQuery({
    queryKey: ["paychecks", user?.id],
    queryFn: () => fetchPaychecks(user?.id),
    enabled: !!user,
  });

  const renderContent = () => {
    if (isLoading) {
      return <Skeleton className="h-64 w-full" />;
    }

    if (isError) {
      return <p className="text-destructive">Failed to load paychecks.</p>;
    }

    if (!paychecks || paychecks.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Paycheck History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold">No Paychecks Yet</h3>
              <p className="text-muted-foreground">Click "Add Paycheck" to get started.</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return <PaycheckList paychecks={paychecks} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Paychecks</h1>
        <AddPaycheckForm />
      </div>
      {renderContent()}
    </div>
  );
};

export default PaychecksPage;