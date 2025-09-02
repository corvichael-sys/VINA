import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlanItem } from "@/types/planItem";
import { PaymentPlan } from "@/types/paymentPlan";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface PlanItemListProps {
  plan: PaymentPlan;
  items: PlanItem[];
}

const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

export const PlanItemList = ({ plan, items }: PlanItemListProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime());
  }, [items]);

  const mutation = useMutation({
    mutationFn: async ({ item, paid }: { item: PlanItem; paid: boolean }) => {
      // Step 1: Update the plan item itself
      const { error: itemUpdateError } = await supabase
        .from("plan_items")
        .update({ paid, paid_date: paid ? new Date().toISOString() : null })
        .eq("id", item.id);
      if (itemUpdateError) throw itemUpdateError;

      // If MARKING AS PAID
      if (paid) {
        // Create a corresponding transaction
        const { error: transactionError } = await supabase.from("transactions").insert({
          user_id: item.user_id,
          date: new Date().toISOString(),
          type: 'expense',
          category: 'Debt Payment',
          amount: item.amount_planned,
          memo: `Payment for plan: ${plan.name}`,
          linked_debt_id: item.debt_id,
          plan_item_id: item.id, // Link transaction to the plan item
        });
        if (transactionError) throw transactionError;

        // If linked to a debt, update the debt's balance (decrease)
        if (item.debt_id) {
          const { data: debt, error: fetchError } = await supabase
            .from('debts')
            .select('current_balance')
            .eq('id', item.debt_id)
            .single();

          if (fetchError) throw fetchError;

          const newBalance = debt.current_balance - item.amount_planned;
          const { error: debtUpdateError } = await supabase
            .from('debts')
            .update({ current_balance: newBalance < 0 ? 0 : newBalance })
            .eq('id', item.debt_id);

          if (debtUpdateError) throw debtUpdateError;
        }
      } 
      // If UN-MARKING AS PAID
      else {
        // Delete the corresponding transaction
        const { error: transactionError } = await supabase
          .from('transactions')
          .delete()
          .eq('plan_item_id', item.id);
        
        if (transactionError) {
            console.warn('Could not delete transaction:', transactionError.message);
        }

        // If linked to a debt, revert the debt's balance (increase)
        if (item.debt_id) {
          const { data: debt, error: fetchError } = await supabase
            .from('debts')
            .select('current_balance')
            .eq('id', item.debt_id)
            .single();

          if (fetchError) throw fetchError;

          const newBalance = debt.current_balance + item.amount_planned;
          const { error: debtUpdateError } = await supabase
            .from('debts')
            .update({ current_balance: newBalance })
            .eq('id', item.debt_id);

          if (debtUpdateError) throw debtUpdateError;
        }
      }
    },
    onSuccess: (_data, _item) => {
      // Invalidate all relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["plan_items", plan.id] });
      queryClient.invalidateQueries({ queryKey: ["paymentPlans"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["newDebts"] });
      queryClient.invalidateQueries({ queryKey: ["debt-summary"] }); // Force summary data to refresh
      toast({ title: "Payment status updated!" });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error updating payment", description: error.message });
    },
  });

  let cumulativePlanned = 0;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Remaining Balance</TableHead>
          <TableHead className="text-center">Paid</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedItems.map((item) => {
          cumulativePlanned += item.amount_planned;
          const remainingBalance = (plan.total_amount || 0) - cumulativePlanned;

          return (
            <TableRow key={item.id} className={item.paid ? "text-muted-foreground" : ""}>
              <TableCell>{format(new Date(item.scheduled_date), "PPP")}</TableCell>
              <TableCell>{formatCurrency(item.amount_planned)}</TableCell>
              <TableCell>{formatCurrency(remainingBalance < 0 ? 0 : remainingBalance)}</TableCell>
              <TableCell className="text-center">
                <Checkbox
                  checked={item.paid}
                  onCheckedChange={(checked) => mutation.mutate({ item, paid: !!checked })}
                  disabled={mutation.isPending}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};