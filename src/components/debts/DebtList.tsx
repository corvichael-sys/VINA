import { Debt } from "@/types/debt";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useState } from "react";
import { EditDebtDialog } from "./EditDebtDialog";
import { DeleteDebtDialog } from "./DeleteDebtDialog";
import { VariantProps } from "class-variance-authority";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { DebtActionsMenu } from "./DebtActionsMenu";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const getSeverityBadgeProps = (severity: Debt['severity']): { variant: VariantProps<typeof badgeVariants>['variant'], className: string } => {
  switch (severity) {
    case 'High':
      return { variant: 'destructive', className: 'bg-red-500 text-white' };
    case 'Medium':
      return { variant: 'secondary', className: 'bg-yellow-500 text-white' };
    case 'Low':
      return { variant: 'default', className: 'bg-green-500 text-white' };
    default:
      return { variant: 'outline', className: '' };
  }
};

interface DebtListProps {
  debts: Debt[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

export const DebtList = ({ debts, isLoading, isError }: DebtListProps) => {
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleEditClick = (debt: Debt) => {
    setSelectedDebt(debt);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (debt: Debt) => {
    setSelectedDebt(debt);
    setDeleteDialogOpen(true);
  };

  const markDebtStatusMutation = useMutation({
    mutationFn: async ({ debt, newStatus }: { debt: Debt; newStatus: 'paid' | 'active' }) => {
      if (newStatus === 'paid') {
        const { error: updateError } = await supabase
          .from('debts')
          .update({ status: 'paid', current_balance: 0 })
          .eq('id', debt.id);
        if (updateError) throw updateError;

        if (debt.current_balance > 0) {
          const { error: transactionError } = await supabase.from('transactions').insert({
            user_id: debt.user_id,
            date: new Date().toISOString(),
            type: 'expense',
            category: 'Debt Payment',
            amount: debt.current_balance,
            memo: `Full payment for ${debt.name}`,
            linked_debt_id: debt.id,
          });
          if (transactionError) throw transactionError;
        }
      } else {
        const { error: updateError } = await supabase
          .from('debts')
          .update({ status: 'active', current_balance: debt.original_amount })
          .eq('id', debt.id);
        if (updateError) throw updateError;

        const { error: deleteTransactionError } = await supabase
          .from('transactions')
          .delete()
          .eq('linked_debt_id', debt.id)
          .eq('category', 'Debt Payment')
          .eq('memo', `Full payment for ${debt.name}`);
        
        if (deleteTransactionError) {
          console.warn('Could not delete associated transaction:', deleteTransactionError.message);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["debt-summary"] });
      toast({ title: "Debt status updated successfully!" });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Failed to update debt status", description: error.message });
    },
  });

  const handleToggleStatus = (debt: Debt) => {
    markDebtStatusMutation.mutate({ debt, newStatus: debt.status === 'paid' ? 'active' : 'paid' });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Your Debts</CardTitle></CardHeader>
        <CardContent><div className="space-y-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div></CardContent>
      </Card>
    );
  }

  if (isError) {
    return <p className="text-destructive">Failed to load debts.</p>;
  }

  if (!debts || debts.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Your Debts</CardTitle></CardHeader>
        <CardContent><div className="text-center py-12"><h3 className="text-lg font-semibold">No Debts Yet</h3><p className="text-muted-foreground">Click "Add New Debt" to get started.</p></div></CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-full">
        <CardHeader><CardTitle>Your Debts</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">Name</TableHead>
                  <TableHead className="text-right min-w-[100px]">Balance</TableHead>
                  <TableHead className="min-w-[100px]">Severity</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="text-right min-w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {debts.map((debt) => {
                  const severityProps = getSeverityBadgeProps(debt.severity);
                  const isTogglingCurrent = markDebtStatusMutation.isPending && markDebtStatusMutation.variables?.debt.id === debt.id;
                  return (
                    <TableRow key={debt.id}>
                      <TableCell className="font-medium">{debt.name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(debt.current_balance)}</TableCell>
                      <TableCell>{debt.severity && <Badge {...severityProps}>{debt.severity}</Badge>}</TableCell>
                      <TableCell><Badge variant={debt.status === 'paid' ? 'default' : 'secondary'}>{debt.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <DebtActionsMenu
                          debt={debt}
                          onEdit={handleEditClick}
                          onDelete={handleDeleteClick}
                          onToggleStatus={handleToggleStatus}
                          isTogglingStatus={isTogglingCurrent}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {selectedDebt && (
        <>
          <EditDebtDialog
            debt={selectedDebt}
            isOpen={isEditDialogOpen}
            onOpenChange={setEditDialogOpen}
          />
          <DeleteDebtDialog
            debt={selectedDebt}
            isOpen={isDeleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          />
        </>
      )}
    </>
  );
};