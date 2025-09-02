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
import { Badge, badgeVariants } from "@/components/ui/badge"; // Import badgeVariants
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { EditDebtDialog } from "./EditDebtDialog";
import { DeleteDebtDialog } from "./DeleteDebtDialog";
import { VariantProps } from "class-variance-authority"; // Import VariantProps
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

// Explicitly type the return value to ensure correct variant inference
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
        // Mark as paid: set status to 'paid' and current_balance to 0
        const { error: updateError } = await supabase
          .from('debts')
          .update({ status: 'paid', current_balance: 0 })
          .eq('id', debt.id);
        if (updateError) throw updateError;

        // Create a transaction for the payment
        if (debt.current_balance > 0) { // Only create transaction if there was a balance
          const { error: transactionError } = await supabase.from('transactions').insert({
            user_id: debt.user_id,
            date: new Date().toISOString(),
            type: 'expense',
            category: 'Debt Payment',
            amount: debt.current_balance, // Amount paid is the current balance being settled
            memo: `Full payment for ${debt.name}`,
            linked_debt_id: debt.id,
          });
          if (transactionError) throw transactionError;
        }
      } else {
        // Mark as active: set status to 'active' and current_balance back to original_amount
        const { error: updateError } = await supabase
          .from('debts')
          .update({ status: 'active', current_balance: debt.original_amount })
          .eq('id', debt.id);
        if (updateError) throw updateError;

        // Delete any associated transaction that was created when it was marked paid
        const { error: deleteTransactionError } = await supabase
          .from('transactions')
          .delete()
          .eq('linked_debt_id', debt.id)
          .eq('category', 'Debt Payment')
          .eq('memo', `Full payment for ${debt.name}`); // Use memo to be more specific
        
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Debts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return <p className="text-destructive">Failed to load debts.</p>;
  }

  if (!debts || debts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Debts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold">No Debts Yet</h3>
            <p className="text-muted-foreground">Click "Add New Debt" to get started.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Your Debts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {debts.map((debt) => {
                const severityProps = getSeverityBadgeProps(debt.severity);
                return (
                  <TableRow key={debt.id}>
                    <TableCell className="font-medium">{debt.name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(debt.current_balance)}</TableCell>
                    <TableCell>
                      {debt.severity && <Badge {...severityProps}>{debt.severity}</Badge>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={debt.status === 'paid' ? 'default' : 'secondary'}>{debt.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEditClick(debt)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => markDebtStatusMutation.mutate({ debt, newStatus: debt.status === 'paid' ? 'active' : 'paid' })}
                            disabled={markDebtStatusMutation.isPending}
                          >
                            {debt.status === 'paid' ? 'Mark as Active' : 'Mark as Paid'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(debt)} className="text-destructive focus:bg-destructive/90 focus:text-destructive-foreground">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
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