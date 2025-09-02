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
    mutationFn: async ({ itemId, paid }: { itemId: string; paid: boolean }) => {
      const { error } = await supabase
        .from("plan_items")
        .update({ paid, paid_date: paid ? new Date().toISOString() : null })
        .eq("id", itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plan_items", plan.id] });
      queryClient.invalidateQueries({ queryKey: ["plan_items"] }); // Invalidate the general list too
      toast({ title: "Payment updated!" });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error updating payment", description: error.message });
    },
  });

  let cumulativePaid = 0;

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
          if (item.paid) {
            cumulativePaid += item.amount_planned;
          }
          const remainingBalance = (plan.total_amount || 0) - cumulativePaid;

          return (
            <TableRow key={item.id} className={item.paid ? "text-muted-foreground" : ""}>
              <TableCell>{format(new Date(item.scheduled_date), "PPP")}</TableCell>
              <TableCell>{formatCurrency(item.amount_planned)}</TableCell>
              <TableCell>{formatCurrency(remainingBalance)}</TableCell>
              <TableCell className="text-center">
                <Checkbox
                  checked={item.paid}
                  onCheckedChange={(checked) => mutation.mutate({ itemId: item.id, paid: !!checked })}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};